"""
Complete inference pipeline audit.
Run: python audit.py
Checks every layer of the diagnosis pipeline and prints a clear PASS/FAIL report.
"""

import os, sys, json, traceback
import numpy as np
import tensorflow as tf
from PIL import Image
import io

print("=" * 60)
print("DIAGNOSIS PIPELINE AUDIT")
print("=" * 60)

MODELS_DIR = "backend/models"
CHEST_TEST_NORMAL   = "ml/datasets/chest_xray/test/NORMAL"
CHEST_TEST_PNEUMONIA= "ml/datasets/chest_xray/test/PNEUMONIA"
TUMOR_TEST_DIR      = "ml/datasets/brain_tumor/Testing"

results = {}

# ── CHECK 1: Required files exist ────────────────────────────────────────────
print("\n[1] Checking required model files...")
required_files = [
    "cnn_pneumonia_v2.h5",
    "cnn_tumor_v2.h5",
    "optimal_threshold_pneumonia.json",
    "class_indices_pneumonia.json",
    "idx_to_class_tumor.json",
    "scaler_pneumonia.pkl",
    "scaler_tumor.pkl",
    "ensemble_pneumonia_svm.pkl",
    "ensemble_pneumonia_random_forest.pkl",
    "ensemble_pneumonia_decision_tree.pkl",
    "ensemble_pneumonia_logistic_regression.pkl",
    "ensemble_tumor_svm.pkl",
    "ensemble_tumor_random_forest.pkl",
    "ensemble_tumor_decision_tree.pkl",
    "ensemble_tumor_logistic_regression.pkl",
]
missing = []
for f in required_files:
    path = os.path.join(MODELS_DIR, f)
    exists = os.path.exists(path)
    print(f"  {'✅' if exists else '❌'} {f}")
    if not exists:
        missing.append(f)

results['missing_files'] = missing
if missing:
    print(f"\n  ⚠ MISSING {len(missing)} FILES — these must be regenerated")

# ── CHECK 2: Load config files ────────────────────────────────────────────────
print("\n[2] Checking config files...")
try:
    with open(f"{MODELS_DIR}/optimal_threshold_pneumonia.json") as f:
        pneu_cfg = json.load(f)
    print(f"  ✅ Pneumonia threshold   : {pneu_cfg['threshold']}")
    print(f"  ✅ Flip probabilities    : {pneu_cfg['flip_probabilities']}")
    print(f"  ✅ Class indices         : {pneu_cfg['class_indices']}")
    results['pneu_threshold'] = pneu_cfg['threshold']
    results['pneu_flip']      = pneu_cfg['flip_probabilities']
except Exception as e:
    print(f"  ❌ Cannot load threshold config: {e}")
    results['pneu_threshold'] = None

try:
    with open(f"{MODELS_DIR}/idx_to_class_tumor.json") as f:
        raw = json.load(f)
        tumor_map = {int(k): v for k, v in raw.items()}
    print(f"  ✅ Tumor class map       : {tumor_map}")
    results['tumor_map'] = tumor_map
except Exception as e:
    print(f"  ❌ Cannot load tumor class map: {e}")
    results['tumor_map'] = None

# ── CHECK 3: Load CNN models ──────────────────────────────────────────────────
print("\n[3] Loading CNN models...")
try:
    pneu_model = tf.keras.models.load_model(f"{MODELS_DIR}/cnn_pneumonia_v2.h5")
    print(f"  ✅ Pneumonia model loaded")
    print(f"     Input  : {pneu_model.input_shape}")
    print(f"     Output : {pneu_model.output_shape}")
    results['pneu_model_ok'] = True
except Exception as e:
    print(f"  ❌ Pneumonia model load FAILED: {e}")
    results['pneu_model_ok'] = False

try:
    tumor_model = tf.keras.models.load_model(f"{MODELS_DIR}/cnn_tumor_v2.h5")
    print(f"  ✅ Tumor model loaded")
    print(f"     Input  : {tumor_model.input_shape}")
    print(f"     Output : {tumor_model.output_shape}")
    results['tumor_model_ok'] = True
except Exception as e:
    print(f"  ❌ Tumor model load FAILED: {e}")
    results['tumor_model_ok'] = False

# ── CHECK 4: Preprocessing pipeline ─────────────────────────────────────────
print("\n[4] Testing preprocessing...")

def preprocess(img_path, size=(240, 240)):
    img = Image.open(img_path).convert('RGB')
    img = img.resize(size, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)

# Find first available test images
normal_img = pneumonia_img = tumor_imgs = None

if os.path.exists(CHEST_TEST_NORMAL):
    files = [f for f in os.listdir(CHEST_TEST_NORMAL) 
             if f.lower().endswith(('.jpg','.jpeg','.png'))]
    if files:
        normal_img = os.path.join(CHEST_TEST_NORMAL, files[0])
        print(f"  ✅ Found NORMAL test image  : {files[0]}")
    else:
        print(f"  ❌ No images in {CHEST_TEST_NORMAL}")
else:
    print(f"  ❌ Path not found: {CHEST_TEST_NORMAL}")

if os.path.exists(CHEST_TEST_PNEUMONIA):
    files = [f for f in os.listdir(CHEST_TEST_PNEUMONIA)
             if f.lower().endswith(('.jpg','.jpeg','.png'))]
    if files:
        pneumonia_img = os.path.join(CHEST_TEST_PNEUMONIA, files[0])
        print(f"  ✅ Found PNEUMONIA test image: {files[0]}")
    else:
        print(f"  ❌ No images in {CHEST_TEST_PNEUMONIA}")
else:
    print(f"  ❌ Path not found: {CHEST_TEST_PNEUMONIA}")

tumor_class_samples = {}
if os.path.exists(TUMOR_TEST_DIR):
    for cls in os.listdir(TUMOR_TEST_DIR):
        cls_path = os.path.join(TUMOR_TEST_DIR, cls)
        if os.path.isdir(cls_path):
            files = [f for f in os.listdir(cls_path)
                     if f.lower().endswith(('.jpg','.jpeg','.png'))]
            if files:
                tumor_class_samples[cls] = os.path.join(cls_path, files[0])
                print(f"  ✅ Found tumor/{cls} sample")

# ── CHECK 5: Pneumonia CNN predictions ───────────────────────────────────────
print("\n[5] Testing Pneumonia CNN inference...")
if results.get('pneu_model_ok') and results.get('pneu_threshold'):
    threshold   = pneu_cfg['threshold']
    flip        = pneu_cfg['flip_probabilities']

    for label, img_path in [('NORMAL', normal_img), ('PNEUMONIA', pneumonia_img)]:
        if img_path is None:
            print(f"  ⚠ Skipping {label} — no test image found")
            continue
        try:
            arr      = preprocess(img_path)
            raw_prob = float(pneu_model.predict(arr, verbose=0)[0][0])
            adj_prob = (1 - raw_prob) if flip else raw_prob
            pred     = 'PNEUMONIA' if adj_prob >= threshold else 'NORMAL'
            correct  = pred == label
            print(f"\n  Image     : {label}")
            print(f"  Raw output: {raw_prob:.6f}")
            print(f"  Adjusted  : {adj_prob:.6f} {'(flipped)' if flip else ''}")
            print(f"  Threshold : {threshold:.4f}")
            print(f"  Predicted : {pred}  {'✅ CORRECT' if correct else '❌ WRONG'}")
        except Exception as e:
            print(f"  ❌ Inference error on {label}: {e}")
            traceback.print_exc()

# ── CHECK 6: Tumor CNN predictions ───────────────────────────────────────────
print("\n[6] Testing Tumor CNN inference...")
if results.get('tumor_model_ok') and results.get('tumor_map'):
    for true_class, img_path in tumor_class_samples.items():
        try:
            arr   = preprocess(img_path)
            probs = tumor_model.predict(arr, verbose=0)[0]
            pred_idx  = int(np.argmax(probs))
            pred_label = tumor_map[pred_idx]
            confidence = float(probs[pred_idx])
            correct    = pred_label.lower() == true_class.lower()
            print(f"\n  True class : {true_class}")
            print(f"  All probs  : { {tumor_map[i]: f'{probs[i]:.4f}' for i in range(len(probs))} }")
            print(f"  Predicted  : {pred_label} ({confidence*100:.1f}%)  "
                  f"{'✅ CORRECT' if correct else '❌ WRONG'}")
        except Exception as e:
            print(f"  ❌ Tumor inference error ({true_class}): {e}")
            traceback.print_exc()

# ── CHECK 7: Ensemble models ──────────────────────────────────────────────────
print("\n[7] Testing Ensemble models...")
import joblib

def get_feature_vector(model, img_path, scaler_path):
    full_model    = model
    feature_model = tf.keras.Model(
        inputs=full_model.input,
        outputs=full_model.layers[-3].output
    )
    arr      = preprocess(img_path)
    features = feature_model.predict(arr, verbose=0)
    scaler   = joblib.load(scaler_path)
    return scaler.transform(features)

for model_type in ['svm','random_forest','decision_tree','logistic_regression']:
    pkl_path = f"{MODELS_DIR}/ensemble_pneumonia_{model_type}.pkl"
    if os.path.exists(pkl_path) and normal_img and results.get('pneu_model_ok'):
        try:
            clf = joblib.load(pkl_path)
            fv  = get_feature_vector(
                pneu_model, normal_img, 
                f"{MODELS_DIR}/scaler_pneumonia.pkl"
            )
            pred  = clf.predict(fv)[0]
            proba = clf.predict_proba(fv)[0]
            
            # Apply flip
            if flip:
                pred  = 1 - pred
                proba = proba[::-1]
            
            label = 'PNEUMONIA' if pred == 1 else 'NORMAL'
            print(f"  {model_type:25s}: {label}  "
                  f"(Normal: {proba[0]*100:.1f}%  Pneumonia: {proba[1]*100:.1f}%)")
        except Exception as e:
            print(f"  ❌ {model_type}: {e}")

# ── CHECK 8: Backend preprocessing vs training preprocessing ─────────────────
print("\n[8] Verifying preprocessing matches training...")
print("  Training used : efficientnet.preprocess_input (scales to -1..1)")
print("  Backend must  : use SAME function — NOT manual /255 normalization")
print("  Check cnn_service.py line that preprocesses the image.")
print("  CORRECT  : tf.keras.applications.efficientnet.preprocess_input(arr)")
print("  WRONG    : arr = arr / 255.0")
print("  WRONG    : arr = (arr - 127.5) / 127.5")

# ── FINAL SUMMARY ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("AUDIT SUMMARY")
print("=" * 60)
if missing:
    print(f"❌ Missing model files    : {len(missing)}")
if not results.get('pneu_model_ok'):
    print("❌ Pneumonia model        : FAILED TO LOAD")
if not results.get('tumor_model_ok'):
    print("❌ Tumor model            : FAILED TO LOAD")
if not results.get('pneu_threshold'):
    print("❌ Threshold config       : MISSING")
if not results.get('tumor_map'):
    print("❌ Tumor class map        : MISSING")
print("\nIf all above pass but results are still wrong:")
print("  → Class index flip bug    (most common)")
print("  → Wrong preprocessing     (second most common)")
print("  → Stale model cached      (restart backend)")
print("  → Threshold not applied   (check cnn_service.py)")
print("=" * 60)

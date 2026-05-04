"""
Empirical calibration script.
Run from: automated-disease-diagnosis/backend/
Tests the ACTUAL model against known NORMAL and PNEUMONIA images,
then writes the correct flip and threshold to the config.
"""
import sys, os, json
import numpy as np
import tensorflow as tf
from PIL import Image
import io

# Paths relative to /backend inside Docker, or backend/ locally
MODEL_PATH     = 'models/cnn_pneumonia_v2.h5'
CONFIG_PATH    = 'models/optimal_threshold_pneumonia.json'
TEST_NORMAL    = '/app/dataset/chest_xray/test/NORMAL'
TEST_PNEUMONIA = '/app/dataset/chest_xray/test/PNEUMONIA'

print("=" * 55)
print("PNEUMONIA MODEL CALIBRATION")
print("=" * 55)

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model not found at {MODEL_PATH}")
    sys.exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print(f"Model input:  {model.input_shape}")
print(f"Model output: {model.output_shape}")

def preprocess(img_path):
    img = Image.open(img_path).convert('RGB').resize((240, 240), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)

def load_samples(folder, n=20):
    files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg','.jpeg','.png'))]
    return [os.path.join(folder, f) for f in files[:n]]

# ── Collect raw outputs ───────────────────────────────────
normal_raws    = []
pneumonia_raws = []

print(f"\nTesting NORMAL samples from {TEST_NORMAL} ...")
for p in load_samples(TEST_NORMAL):
    raw = float(model.predict(preprocess(p), verbose=0)[0][0])
    normal_raws.append(raw)

print(f"Testing PNEUMONIA samples from {TEST_PNEUMONIA} ...")
for p in load_samples(TEST_PNEUMONIA):
    raw = float(model.predict(preprocess(p), verbose=0)[0][0])
    pneumonia_raws.append(raw)

mean_normal   = np.mean(normal_raws)
mean_pneumonia= np.mean(pneumonia_raws)

print(f"\n--- Raw Sigmoid Means ---")
print(f"  NORMAL    images → mean raw output: {mean_normal:.4f}")
print(f"  PNEUMONIA images → mean raw output: {mean_pneumonia:.4f}")

# ── Determine flip ────────────────────────────────────────
# If mean_normal > mean_pneumonia, high output = NORMAL → flip needed
# If mean_normal < mean_pneumonia, high output = PNEUMONIA → no flip
flip = bool(mean_normal > mean_pneumonia)
print(f"\n  → flip_probabilities: {flip}")
if flip:
    print("    (High raw output = NORMAL, we invert so high adj = PNEUMONIA)")
else:
    print("    (High raw output = PNEUMONIA, no inversion needed)")

# ── Find optimal threshold on all samples ────────────────
all_raws   = normal_raws + pneumonia_raws
all_labels = [0] * len(normal_raws) + [1] * len(pneumonia_raws)  # 0=NORMAL, 1=PNEUMONIA

if flip:
    all_probs = [1 - r for r in all_raws]
else:
    all_probs = all_raws

from sklearn.metrics import roc_curve
fpr, tpr, thresholds = roc_curve(all_labels, all_probs)
optimal_idx = np.argmax(tpr - fpr)
optimal_threshold = float(thresholds[optimal_idx])
print(f"\n  → Optimal threshold: {optimal_threshold:.4f}")

# ── Verify results ────────────────────────────────────────
print(f"\n--- Verification (using flip={flip}, threshold={optimal_threshold:.4f}) ---")
normal_correct    = sum(1 for r in normal_raws    if ((1-r if flip else r) <  optimal_threshold))
pneumonia_correct = sum(1 for r in pneumonia_raws if ((1-r if flip else r) >= optimal_threshold))
total = len(normal_raws) + len(pneumonia_raws)
correct = normal_correct + pneumonia_correct

print(f"  NORMAL    correct: {normal_correct}/{len(normal_raws)}")
print(f"  PNEUMONIA correct: {pneumonia_correct}/{len(pneumonia_raws)}")
print(f"  Overall accuracy : {correct}/{total} = {correct/total*100:.1f}%")

# ── Save config ───────────────────────────────────────────
config = {
    "threshold": optimal_threshold,
    "flip_probabilities": flip,
    "class_indices": {"NORMAL": 0, "PNEUMONIA": 1}
}
with open(CONFIG_PATH, 'w') as f:
    json.dump(config, f, indent=2)

print(f"\n✅ Config saved to {CONFIG_PATH}")
print(json.dumps(config, indent=2))
print("=" * 55)
print("Restart backend for changes to take effect.")

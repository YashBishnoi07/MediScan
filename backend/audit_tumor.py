"""
Brain tumor model accuracy audit.
Run from: automated-disease-diagnosis/backend/
Tests the CNN against known test images for each tumor class
and prints a per-class confusion matrix.
"""
import sys, os, json
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH    = 'models/cnn_tumor_v2.h5'
CLASS_MAP_PATH= 'models/idx_to_class_tumor.json'
TEST_ROOT     = '/app/dataset/brain_tumor/Testing'
N_SAMPLES     = 20  # images per class to test

print("=" * 60)
print("BRAIN TUMOR MODEL ACCURACY AUDIT")
print("=" * 60)

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model not found at {MODEL_PATH}"); sys.exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print(f"Model input : {model.input_shape}")
print(f"Model output: {model.output_shape}")

with open(CLASS_MAP_PATH) as f:
    idx_to_class = {int(k): v for k, v in json.load(f).items()}

# Reverse map: folder name → index
class_to_idx = {v: k for k, v in idx_to_class.items()}
print(f"Class map   : {idx_to_class}")

def preprocess(path):
    img = Image.open(path).convert('RGB').resize((240, 240), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)

classes = sorted(os.listdir(TEST_ROOT))
print(f"\nClasses found in test folder: {classes}")
print(f"\nRunning inference on {N_SAMPLES} images per class...\n")

total_correct = 0
total_tested  = 0

# Per-class confusion counts
confusion = {c: {c2: 0 for c2 in classes} for c in classes}

for true_class in classes:
    folder = os.path.join(TEST_ROOT, true_class)
    files  = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg','.jpeg','.png'))][:N_SAMPLES]
    
    if not files:
        print(f"  ⚠ No images in {folder}"); continue
    
    correct = 0
    all_probs_mean = np.zeros(len(idx_to_class))
    
    for fname in files:
        arr   = preprocess(os.path.join(folder, fname))
        probs = model.predict(arr, verbose=0)[0]
        pred_idx   = int(np.argmax(probs))
        pred_label = idx_to_class[pred_idx]
        
        all_probs_mean += probs
        confusion[true_class][pred_label] += 1
        if pred_label == true_class:
            correct += 1
    
    all_probs_mean /= len(files)
    accuracy = correct / len(files) * 100
    total_correct += correct
    total_tested  += len(files)
    
    print(f"  [{true_class.upper():12s}] Accuracy: {correct}/{len(files)} = {accuracy:.0f}%")
    for i, cls in idx_to_class.items():
        bar = "█" * int(all_probs_mean[i] * 20)
        print(f"    → {cls:15s}: {all_probs_mean[i]*100:5.1f}% {bar}")

# Overall
print(f"\n{'='*60}")
print(f"OVERALL ACCURACY: {total_correct}/{total_tested} = {total_correct/total_tested*100:.1f}%")
print(f"{'='*60}")

# Confusion matrix
print(f"\nCONFUSION MATRIX (rows=true, cols=predicted):")
header = f"{'TRUE↓ / PRED→':18s}" + "".join(f"{c[:8]:10s}" for c in classes)
print(header)
for true_class in classes:
    row = f"{true_class:18s}"
    for pred_class in classes:
        count = confusion[true_class][pred_class]
        mark  = "✅" if true_class == pred_class else "  "
        row  += f"{count:6d}{mark}  "
    print(row)

print(f"\n{'='*60}")
print("Diagnosis: If accuracy < 60% for any class, that class needs retraining.")
print("If class A is frequently predicted as class B, idx_to_class may be swapped.")

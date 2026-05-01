import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import json
import os

# Paths
MODEL_PATH = 'models/cnn_pneumonia_v2.h5'
THRESHOLD_PATH = 'models/optimal_threshold_pneumonia.json'
NORMAL_IMG = 'dataset/chest_xray/test/NORMAL/IM-0001-0001.jpeg'
PNEU_IMG = 'dataset/chest_xray/test/PNEUMONIA/person1_bacteria_1.jpeg'

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model not found at {MODEL_PATH}")
    exit()

# Load model
model = tf.keras.models.load_model(MODEL_PATH)
print(f"--- Model Info ---")
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

# Load threshold
threshold = 0.5
flip = False
if os.path.exists(THRESHOLD_PATH):
    with open(THRESHOLD_PATH) as f:
        data = json.load(f)
        threshold = data.get('threshold', 0.5)
        flip = data.get('flip_probabilities', False)
print(f"Saved threshold: {threshold} | Flip labels: {flip}")

def test_img(path, label):
    if not os.path.exists(path):
        print(f"Skip: {path} not found")
        return
    img = load_img(path, target_size=(240, 240))
    arr = img_to_array(img)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)

    raw_pred = model.predict(arr, verbose=0)[0][0]
    prob = (1 - raw_pred) if flip else raw_pred
    
    print(f"\nTest {label} image ({path}):")
    print(f"  Raw output: {raw_pred:.4f}")
    print(f"  Adjusted: {prob:.4f}")
    print(f"  Result: {'PNEUMONIA' if prob >= threshold else 'NORMAL'}")
    print(f"  Expected: {label}")

test_img(NORMAL_IMG, "NORMAL")
test_img(PNEU_IMG, "PNEUMONIA")

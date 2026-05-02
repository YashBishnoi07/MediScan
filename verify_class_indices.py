# verify_class_indices.py
import tensorflow as tf
import json
import os

# Create dummy generator to check index mapping
gen = tf.keras.preprocessing.image.ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

print("Checking Pneumonia dataset indices...")
pneu_dir = 'ml/datasets/chest_xray/train'
if os.path.exists(pneu_dir):
    data = gen.flow_from_directory(
        pneu_dir,
        target_size=(240, 240),
        batch_size=32,
        class_mode='binary'
    )
    print("Pneumonia class indices:", data.class_indices)
    # MUST be {'NORMAL': 0, 'PNEUMONIA': 1}
    # If {'NORMAL': 1, 'PNEUMONIA': 0} → flip_probabilities = True

    flip = data.class_indices.get('PNEUMONIA', 1) == 0
    print(f"flip_probabilities = {flip}")

    config = {
        "threshold": 0.5,           # Will be updated by training script
        "flip_probabilities": flip,
        "class_indices": data.class_indices
    }
    os.makedirs('backend/models', exist_ok=True)
    with open('backend/models/optimal_threshold_pneumonia.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("Saved pneumonia config:", config)
else:
    print(f"❌ Path not found: {pneu_dir}")

print("\nChecking Tumor dataset indices...")
tumor_dir = 'ml/datasets/brain_tumor/Training'
if os.path.exists(tumor_dir):
    data_t = gen.flow_from_directory(
        tumor_dir,
        target_size=(240, 240),
        batch_size=32,
        class_mode='categorical'
    )
    print("\nTumor class indices:", data_t.class_indices)
    idx_to_class = {str(v): k for k, v in data_t.class_indices.items()}
    print("idx_to_class:", idx_to_class)
    with open('backend/models/idx_to_class_tumor.json', 'w') as f:
        json.dump(idx_to_class, f, indent=2)
    print("Saved tumor class map.")
else:
    print(f"❌ Path not found: {tumor_dir}")

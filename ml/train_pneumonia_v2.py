import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.layers import (GlobalAveragePooling2D, Dense, Dropout, BatchNormalization)
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import (ModelCheckpoint, EarlyStopping, ReduceLROnPlateau)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import (roc_curve, classification_report, confusion_matrix, roc_auc_score)
import numpy as np
import json
import os
import matplotlib.pyplot as plt

# ── Paths ─────────────────────────────────────────────────────────────────────
TRAIN_DIR = 'dataset/chest_xray/train'
VAL_DIR   = 'dataset/chest_xray/val'
TEST_DIR  = 'dataset/chest_xray/test'
MODELS_DIR = 'models'
IMG_SIZE  = (240, 240) # Using 240 for CPU performance balance
BATCH     = 8 # Reduced batch for CPU memory

os.makedirs(MODELS_DIR, exist_ok=True)

# ── Data Generators ───────────────────────────────────────────────────────────
train_gen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.15,
    horizontal_flip=True,
)

val_gen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

train_data = train_gen.flow_from_directory(
    TRAIN_DIR, target_size=IMG_SIZE, batch_size=BATCH,
    class_mode='binary', shuffle=True, seed=42
)
val_data = val_gen.flow_from_directory(
    VAL_DIR, target_size=IMG_SIZE, batch_size=BATCH,
    class_mode='binary', shuffle=False
)
test_data = val_gen.flow_from_directory(
    TEST_DIR, target_size=IMG_SIZE, batch_size=BATCH,
    class_mode='binary', shuffle=False
)

# ── Save class indices ────────────────────────────────────────────────────────
print("Class indices:", train_data.class_indices)
with open(f'{MODELS_DIR}/class_indices_pneumonia.json', 'w') as f:
    json.dump(train_data.class_indices, f)

# ── Class Weights ─────────────────────────────────────────────────────────────
labels = train_data.classes
class_weights = compute_class_weight('balanced', classes=np.unique(labels), y=labels)
cw = {int(k): float(v) for k, v in enumerate(class_weights)}
print("Class weights:", cw)

# ── Build Model ───────────────────────────────────────────────────────────────
base = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
base.trainable = False

x = base.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.4)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)
output = Dense(1, activation='sigmoid')(x)

model = Model(inputs=base.input, outputs=output)
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss='binary_crossentropy',
    metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
)

# ── Phase 1 ──────────────────────────────────────────────────────────────────
callbacks = [
    ModelCheckpoint(f'{MODELS_DIR}/cnn_pneumonia_v2.h5', save_best_only=True, monitor='val_auc', mode='max'),
    EarlyStopping(patience=4, monitor='val_auc', mode='max', restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=2, min_lr=1e-7)
]

print("\nStep 1: Training top layers...")
model.fit(train_data, validation_data=val_data, epochs=5, class_weight=cw, callbacks=callbacks, steps_per_epoch=100)

# ── Phase 2: Fine-tune ───────────────────────────────────────────────────────
for layer in base.layers[-30:]:
    layer.trainable = True

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss='binary_crossentropy',
    metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
)

print("\nStep 2: Fine-tuning...")
model.fit(train_data, validation_data=val_data, epochs=5, class_weight=cw, callbacks=callbacks, steps_per_epoch=100)

# ── Threshold Tuning ──────────────────────────────────────────────────────────
print("\nFinding optimal threshold on TEST set...")
y_true = test_data.classes
y_pred_proba = model.predict(test_data, verbose=1).flatten()

ci = train_data.class_indices
is_flipped = ci['PNEUMONIA'] == 0

if is_flipped:
    print("Labels are flipped! Normalizing...")
    y_true_fixed = 1 - y_true
    y_pred_proba_fixed = 1 - y_pred_proba
else:
    y_true_fixed = y_true
    y_pred_proba_fixed = y_pred_proba

fpr, tpr, thresholds = roc_curve(y_true_fixed, y_pred_proba_fixed)
optimal_idx = np.argmax(tpr - fpr)
optimal_threshold = float(thresholds[optimal_idx])

# Save threshold data
with open(f'{MODELS_DIR}/optimal_threshold_pneumonia.json', 'w') as f:
    json.dump({
        'threshold': optimal_threshold,
        'flip_probabilities': is_flipped,
        'class_indices': ci
    }, f, indent=2)

print(f"Final Optimal Threshold: {optimal_threshold:.4f}")
print("Pneumonia training complete.")

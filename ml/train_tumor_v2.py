import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.layers import (GlobalAveragePooling2D, Dense, Dropout, BatchNormalization)
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import (ModelCheckpoint, EarlyStopping, ReduceLROnPlateau)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import json
import os

# ── Paths ─────────────────────────────────────────────────────────────────────
TRAIN_DIR = 'dataset/brain_tumor/Training'
TEST_DIR  = 'dataset/brain_tumor/Testing'
MODELS_DIR = 'models'
IMG_SIZE  = (240, 240)
BATCH     = 8

os.makedirs(MODELS_DIR, exist_ok=True)

# ── Data Generators ───────────────────────────────────────────────────────────
train_gen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.15
)

test_gen = ImageDataGenerator(preprocessing_function=tf.keras.applications.efficientnet.preprocess_input)

train_data = train_gen.flow_from_directory(TRAIN_DIR, target_size=IMG_SIZE, batch_size=BATCH, class_mode='categorical', subset='training', seed=42)
val_data = train_gen.flow_from_directory(TRAIN_DIR, target_size=IMG_SIZE, batch_size=BATCH, class_mode='categorical', subset='validation', seed=42)
test_data = test_gen.flow_from_directory(TEST_DIR, target_size=IMG_SIZE, batch_size=BATCH, class_mode='categorical', shuffle=False)

print("Tumor class indices:", train_data.class_indices)
with open(f'{MODELS_DIR}/class_indices_tumor.json', 'w') as f:
    json.dump(train_data.class_indices, f)

# ── Build Model ───────────────────────────────────────────────────────────────
base = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
base.trainable = False

x = base.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.3)(x)
output = Dense(4, activation='softmax')(x)

model = Model(inputs=base.input, outputs=output)
model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss='categorical_crossentropy', metrics=['accuracy', tf.keras.metrics.AUC(name='auc')])

callbacks = [
    ModelCheckpoint(f'{MODELS_DIR}/cnn_tumor_v2.h5', save_best_only=True, monitor='val_accuracy', mode='max'),
    EarlyStopping(patience=5, monitor='val_accuracy', mode='max', restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=2, min_lr=1e-7)
]

print("\nStep 1: Training top layers...")
model.fit(train_data, validation_data=val_data, epochs=5, callbacks=callbacks, steps_per_epoch=100)

for layer in base.layers[-40:]:
    layer.trainable = True

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss='categorical_crossentropy', metrics=['accuracy', tf.keras.metrics.AUC(name='auc')])

print("\nStep 2: Fine-tuning...")
model.fit(train_data, validation_data=val_data, epochs=5, callbacks=callbacks, steps_per_epoch=100)

# Save inverse map
idx_to_class = {v: k for k, v in train_data.class_indices.items()}
with open(f'{MODELS_DIR}/idx_to_class_tumor.json', 'w') as f:
    json.dump({str(k): v for k, v in idx_to_class.items()}, f)

print("Tumor training complete.")

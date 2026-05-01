"""
CNN Training Script for Pneumonia and Brain Tumor datasets.
Upgraded to EfficientNetB3 with Transfer Learning and Threshold Tuning.
"""
import os
import json
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import roc_curve
import matplotlib.pyplot as plt

def build_transfer_learning_model(num_classes, is_binary=True, input_shape=(240, 240, 3)):
    """Build an EfficientNetB3 based transfer learning model."""
    base = EfficientNetB3(weights='imagenet', include_top=False, input_shape=input_shape)
    base.trainable = False  # Freeze initially
    
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    
    if is_binary:
        output = Dense(1, activation='sigmoid')(x)
        loss = 'binary_crossentropy'
    else:
        output = Dense(num_classes, activation='softmax')(x)
        loss = 'categorical_crossentropy'
        
    model = Model(inputs=base.input, outputs=output)
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3), 
                  loss=loss, 
                  metrics=['accuracy', tf.keras.metrics.AUC(name='auc')])
    return model, base

def run_training(disease_type, data_dir, batch_size=8, epochs=15):
    """Generic training function for both diseases."""
    print(f"--- Training {disease_type.upper()} Model (v2) ---")
    
    # Flexible directory detection
    train_dir = os.path.join(data_dir, 'train')
    if not os.path.exists(train_dir):
        train_dir = os.path.join(data_dir, 'Training')
        
    val_dir = os.path.join(data_dir, 'val')
    if not os.path.exists(val_dir):
        val_dir = os.path.join(data_dir, 'Testing')
    
    if not os.path.exists(train_dir):
        print(f"Error: Training directory not found in {data_dir}!")
        return

    # Data Augmentation
    train_datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
    )
    
    val_datagen = ImageDataGenerator(preprocessing_function=tf.keras.applications.efficientnet.preprocess_input)
    
    is_binary = (disease_type == "pneumonia")
    class_mode = 'binary' if is_binary else 'categorical'
    
    train_generator = train_datagen.flow_from_directory(
        train_dir, target_size=(240, 240), batch_size=batch_size, class_mode=class_mode
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir, target_size=(240, 240), batch_size=batch_size, class_mode=class_mode
    )

    # Class Weights
    labels = train_generator.classes
    num_classes = len(train_generator.class_indices)
    weights = compute_class_weight('balanced', classes=np.unique(labels), y=labels)
    class_weight = {i: weights[i] for i in range(len(weights))}
    
    model, base = build_transfer_learning_model(num_classes=num_classes, is_binary=is_binary)
    
    # Save relative to script location
    models_dir = os.path.join(os.path.dirname(__file__), '../models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, f'cnn_{disease_type}_v2.h5')
    checkpoint = ModelCheckpoint(model_path, monitor='val_auc' if is_binary else 'val_accuracy', save_best_only=True, mode='max')
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    # Train top layers
    print("Step 1: Training top layers...")
    history = model.fit(
        train_generator,
        steps_per_epoch=min(len(train_generator), 150),
        epochs=2,
        validation_data=val_generator,
        class_weight=class_weight,
        callbacks=[checkpoint]
    )

    # Fine-tuning
    print("Step 2: Fine-tuning last 20 layers...")
    base.trainable = True
    for layer in base.layers[:-20]:
        layer.trainable = False
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5), 
                  loss='binary_crossentropy' if is_binary else 'categorical_crossentropy', 
                  metrics=['accuracy', tf.keras.metrics.AUC(name='auc')])
    
    model.fit(
        train_generator,
        steps_per_epoch=min(len(train_generator), 150),
        epochs=3,
        validation_data=val_generator,
        class_weight=class_weight,
        callbacks=[checkpoint, early_stop]
    )

    if is_binary:
        # Tuning Threshold for Binary
        print("Step 3: Tuning Decision Threshold...")
        val_generator.reset()
        y_true = val_generator.classes
        y_pred = model.predict(val_generator).flatten()
        
        fpr, tpr, thresholds = roc_curve(y_true, y_pred)
        optimal_idx = np.argmax(tpr - fpr)
        optimal_threshold = float(thresholds[optimal_idx])
        
        val_auc = history.history.get('val_auc', [0.0])[-1]
        threshold_path = os.path.join(models_dir, f'optimal_threshold_{disease_type}.json')
        with open(threshold_path, 'w') as f:
            json.dump({"threshold": optimal_threshold, "metrics": {"auc": float(val_auc)}}, f)
        print(f"Optimal threshold saved: {optimal_threshold}")

    return model

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--disease', type=str, required=True, choices=['pneumonia', 'tumor'])
    parser.add_argument('--data_dir', type=str, required=True)
    parser.add_argument('--batch_size', type=int, default=8)
    parser.add_argument('--epochs', type=int, default=10)
    args = parser.parse_args()
    
    run_training(args.disease, args.data_dir, args.batch_size, args.epochs)

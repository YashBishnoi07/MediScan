"""
Classical ML Models Training Script.
Extracts features from trained CNNs and trains SVM, RF, DT, LR.
"""
import os
import argparse
import numpy as np
import joblib
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import classification_report, accuracy_score
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def extract_features(data_dir, cnn_model_path, target_size=(224, 224)):
    """Extract features from the penultimate layer of the CNN."""
    print(f"Loading CNN model from {cnn_model_path}...")
    full_model = load_model(cnn_model_path)
    
    # Create a new model that outputs the Flatten/Dense feature layer
    # For our standard architecture, layer -3 is the Flatten or first Dense layer
    feature_layer_name = None
    for layer in reversed(full_model.layers):
        if isinstance(layer, tf.keras.layers.Dense) and layer.name != full_model.layers[-1].name:
            feature_layer_name = layer.name
            break
            
    if not feature_layer_name:
        feature_layer_name = full_model.layers[-2].name
        
    feature_extractor = tf.keras.Model(
        inputs=full_model.inputs,
        outputs=full_model.get_layer(feature_layer_name).output
    )
    
    print("Extracting features from dataset...")
    datagen = ImageDataGenerator(rescale=1./255)
    generator = datagen.flow_from_directory(
        data_dir, target_size=target_size, batch_size=32, 
        class_mode='categorical', shuffle=False
    )
    
    features = feature_extractor.predict(generator, verbose=1)
    labels = generator.classes
    class_indices = generator.class_indices
    
    return features, labels, class_indices

def train_classical_models(features, labels, disease_type):
    """Train SVM, RF, DT, and LR models on extracted features."""
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
    
    print(f"\n--- Training Classical ML Models for {disease_type} ---")
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    models_to_train = {
        'svm': (SVC(probability=True, random_state=42), 
                {'C': [0.1, 1, 10], 'kernel': ['rbf', 'linear']}),
                
        'rf': (RandomForestClassifier(random_state=42), 
               {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20]}),
               
        'dt': (DecisionTreeClassifier(random_state=42), 
               {'max_depth': [5, 10, None], 'min_samples_split': [2, 5]}),
               
        'lr': (LogisticRegression(max_iter=1000, random_state=42), 
               {'C': [0.1, 1, 10]})
    }
    
    trained_models = {}
    
    for name, (model, params) in models_to_train.items():
        print(f"\nTraining {name.upper()}...")
        # Use GridSearch for hyperparameter tuning
        # Reduced cv to 3 for faster training
        clf = GridSearchCV(model, params, cv=3, n_jobs=-1, verbose=1)
        clf.fit(X_train, y_train)
        
        best_model = clf.best_estimator_
        trained_models[name] = best_model
        
        y_pred = best_model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"Best params: {clf.best_params_}")
        print(f"Test Accuracy: {acc:.4f}")
        
        # Save model
        save_path = f"../backend/models/{name}_{disease_type}.pkl"
        joblib.dump(best_model, save_path)
        print(f"Saved {name.upper()} model to {save_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Classical ML Models")
    parser.add_argument('--disease', type=str, choices=['pneumonia', 'tumor'], required=True)
    parser.add_argument('--data_dir', type=str, required=True)
    parser.add_argument('--cnn_model', type=str, required=True, help="Path to trained CNN .h5 model")
    
    args = parser.parse_args()
    
    os.makedirs('../backend/models', exist_ok=True)
    
    # 1. Extract Features
    features, labels, class_indices = extract_features(args.data_dir, args.cnn_model)
    
    print(f"Extracted feature shape: {features.shape}")
    print(f"Class indices: {class_indices}")
    
    # 2. Train Models
    train_classical_models(features, labels, args.disease)

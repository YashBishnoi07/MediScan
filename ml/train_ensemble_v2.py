import tensorflow as tf
import numpy as np
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import joblib
import json
import os

MODELS_DIR = 'models'
IMG_SIZE = (240, 240)

def extract_features(model_path, data_dir, class_mode):
    print(f"Extracting features using model: {model_path}...")
    full_model = tf.keras.models.load_model(model_path)
    # The GlobalAveragePooling2D layer is the best for features
    feature_model = tf.keras.Model(inputs=full_model.input, outputs=full_model.get_layer('global_average_pooling2d').output)
    
    gen = tf.keras.preprocessing.image.ImageDataGenerator(preprocessing_function=tf.keras.applications.efficientnet.preprocess_input)
    data = gen.flow_from_directory(data_dir, target_size=IMG_SIZE, batch_size=32, class_mode=class_mode, shuffle=False)
    
    features = feature_model.predict(data, verbose=1)
    return features, data.classes, data.class_indices

def train_pneu_ensemble():
    X_train, y_train, ci = extract_features(f'{MODELS_DIR}/cnn_pneumonia_v2.h5', 'dataset/chest_xray/train', 'binary')
    X_test, y_test, _ = extract_features(f'{MODELS_DIR}/cnn_pneumonia_v2.h5', 'dataset/chest_xray/test', 'binary')
    
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    
    with open(f'{MODELS_DIR}/optimal_threshold_pneumonia.json') as f:
        config = json.load(f)
    if config['flip_probabilities']:
        y_train = 1 - y_train
        y_test = 1 - y_test

    models = {
        'svm': SVC(probability=True, random_state=42),
        'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'decision_tree': DecisionTreeClassifier(max_depth=10, random_state=42),
        'logistic_regression': LogisticRegression(max_iter=1000, random_state=42)
    }
    
    metrics = {}
    for name, clf in models.items():
        print(f"Training Pneumonia {name}...")
        clf.fit(X_train_s, y_train)
        y_pred = clf.predict(X_test_s)
        report = classification_report(y_test, y_pred, output_dict=True)
        metrics[name] = {k: round(v*100, 2) for k, v in report['weighted avg'].items() if k != 'support'}
        joblib.dump(clf, f'{MODELS_DIR}/ensemble_pneumonia_{name}.pkl')
    
    joblib.dump(scaler, f'{MODELS_DIR}/scaler_pneumonia.pkl')
    with open(f'{MODELS_DIR}/ensemble_metrics_pneumonia.json', 'w') as f:
        json.dump(metrics, f)

def train_tumor_ensemble():
    X_train, y_train, ci = extract_features(f'{MODELS_DIR}/cnn_tumor_v2.h5', 'dataset/brain_tumor/Training', 'categorical')
    X_test, y_test, _ = extract_features(f'{MODELS_DIR}/cnn_tumor_v2.h5', 'dataset/brain_tumor/Testing', 'categorical')
    
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    
    models = {
        'svm': SVC(probability=True, random_state=42),
        'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'decision_tree': DecisionTreeClassifier(max_depth=10, random_state=42),
        'logistic_regression': LogisticRegression(max_iter=1000, random_state=42)
    }
    
    metrics = {}
    for name, clf in models.items():
        print(f"Training Tumor {name}...")
        clf.fit(X_train_s, y_train)
        y_pred = clf.predict(X_test_s)
        report = classification_report(y_test, y_pred, output_dict=True)
        metrics[name] = {k: round(v*100, 2) for k, v in report['weighted avg'].items() if k != 'support'}
        joblib.dump(clf, f'{MODELS_DIR}/ensemble_tumor_{name}.pkl')
    
    joblib.dump(scaler, f'{MODELS_DIR}/scaler_tumor.pkl')
    with open(f'{MODELS_DIR}/ensemble_metrics_tumor.json', 'w') as f:
        json.dump(metrics, f)

if __name__ == "__main__":
    train_pneu_ensemble()
    train_tumor_ensemble()
    print("All ensembles trained.")

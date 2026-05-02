"""
Single source of truth for all model loading.
All services import from here — never load models inline.
"""
import tensorflow as tf
import joblib
import json
import os

_models = {}

def get_feature_extractor(model):
    """
    Finds the GlobalAveragePooling2D layer to use as a feature extractor.
    This is more robust than using hardcoded layer indices like layers[-3].
    """
    for layer in reversed(model.layers):
        if 'pool' in layer.name.lower() or isinstance(layer, tf.keras.layers.GlobalAveragePooling2D):
            return tf.keras.Model(inputs=model.input, outputs=layer.output)
    
    # Fallback to penultimate if pooling not found by name
    return tf.keras.Model(inputs=model.input, outputs=model.layers[-3].output)

def load_all_models():
    """Call this ONCE in main.py on startup."""
    global _models
    
    BASE = os.path.dirname(os.path.abspath(__file__))
    MODELS_DIR = os.path.join(BASE, '..', 'models')
    
    print("\n" + "="*50)
    print("LOADING ALL MODELS")
    print("="*50)
    
    # CNN models
    pneu_path  = os.path.join(MODELS_DIR, 'cnn_pneumonia_v2.h5')
    tumor_path = os.path.join(MODELS_DIR, 'cnn_tumor_v2.h5')
    
    print(f"Loading pneumonia CNN from: {pneu_path}")
    _models['pneu_cnn'] = tf.keras.models.load_model(pneu_path)
    print(f"  Input shape : {_models['pneu_cnn'].input_shape}")
    
    print(f"Loading tumor CNN from: {tumor_path}")
    _models['tumor_cnn'] = tf.keras.models.load_model(tumor_path)

    # Feature extractors (Pooling layer for ensemble features)
    print("Creating feature extractors...")
    _models['pneu_features']  = get_feature_extractor(_models['pneu_cnn'])
    _models['tumor_features'] = get_feature_extractor(_models['tumor_cnn'])
    
    print(f"  Pneu Features Shape : {_models['pneu_features'].output_shape}")
    print(f"  Tumor Features Shape: {_models['tumor_features'].output_shape}")
    
    # Config files
    pneu_cfg_path = os.path.join(MODELS_DIR, 'optimal_threshold_pneumonia.json')
    if os.path.exists(pneu_cfg_path):
        with open(pneu_cfg_path) as f:
            _models['pneu_cfg'] = json.load(f)
    
    tumor_map_path = os.path.join(MODELS_DIR, 'idx_to_class_tumor.json')
    if os.path.exists(tumor_map_path):
        with open(tumor_map_path) as f:
            raw = json.load(f)
            _models['tumor_map'] = {int(k): v for k, v in raw.items()}
    
    # Scalers
    _models['pneu_scaler']  = joblib.load(os.path.join(MODELS_DIR, 'scaler_pneumonia.pkl'))
    _models['tumor_scaler'] = joblib.load(os.path.join(MODELS_DIR, 'scaler_tumor.pkl'))
    
    # Ensemble models
    for disease in ['pneumonia', 'tumor']:
        for algo in ['svm','random_forest','decision_tree','logistic_regression']:
            key  = f'{disease}_{algo}'
            path = os.path.join(MODELS_DIR, f'ensemble_{key}.pkl')
            if os.path.exists(path):
                _models[f'ensemble_{key}'] = joblib.load(path)
    
    print("\n✅ All models loaded successfully")
    print("="*50 + "\n")

def get(key):
    if key not in _models:
        raise RuntimeError(f"Model '{key}' not loaded. Call load_all_models() first.")
    return _models[key]

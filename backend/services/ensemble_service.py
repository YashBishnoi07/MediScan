import numpy as np
import joblib
import json
import os
import tensorflow as tf
from .cnn_service import preprocess_image

class EnsembleService:
    _models_cache = {}

    @staticmethod
    def _get_feature_model(disease_type):
        cache_key = f"feature_{disease_type}"
        if cache_key not in EnsembleService._models_cache:
            model_path = f'models/cnn_{disease_type}_v2.h5'
            if not os.path.exists(model_path): return None
            full = tf.keras.models.load_model(model_path)
            # Use the pooling layer for features
            EnsembleService._models_cache[cache_key] = tf.keras.Model(
                inputs=full.input,
                outputs=full.get_layer('global_average_pooling2d').output
            )
        return EnsembleService._models_cache[cache_key]

    @staticmethod
    def _get_ensemble_model(disease_type, model_name):
        cache_key = f"ensemble_{disease_type}_{model_name}"
        if cache_key not in EnsembleService._models_cache:
            model_path = f'models/ensemble_{disease_type}_{model_name}.pkl'
            if os.path.exists(model_path):
                EnsembleService._models_cache[cache_key] = joblib.load(model_path)
            else:
                return None
        return EnsembleService._models_cache[cache_key]

    @staticmethod
    def run_pneumonia_ensemble(image_bytes, cnn_prediction: str):
        feature_model = EnsembleService._get_feature_model("pneumonia")
        if not feature_model: return None
        
        arr = preprocess_image(image_bytes, target_size=(240, 240))
        features = feature_model.predict(arr, verbose=0)
        
        # Cache scaler too
        if "scaler_pneumonia" not in EnsembleService._models_cache:
            EnsembleService._models_cache["scaler_pneumonia"] = joblib.load('models/scaler_pneumonia.pkl')
        scaler = EnsembleService._models_cache["scaler_pneumonia"]
        features_s = scaler.transform(features)
        
        with open('models/optimal_threshold_pneumonia.json') as f:
            config = json.load(f)
            
        model_names = ['svm', 'random_forest', 'decision_tree', 'logistic_regression']
        results = {}
        votes = 0
        
        for name in model_names:
            clf = EnsembleService._get_ensemble_model("pneumonia", name)
            if not clf: continue
            
            pred = clf.predict(features_s)[0]
            proba = clf.predict_proba(features_s)[0]
            
            if config['flip_probabilities']:
                pred = 1 - pred
                proba = proba[::-1]
                
            label = 'PNEUMONIA' if pred == 1 else 'NORMAL'
            if pred == 1: votes += 1
            
            results[name] = {
                'prediction': label,
                'confidence': float(np.max(proba)) * 100
            }
            
        # Determine final prediction with CNN Tie-Breaker
        if votes > 2:
            ensemble_pred = 'PNEUMONIA'
        elif votes < 2:
            ensemble_pred = 'NORMAL'
        else:
            # Tie (2 vs 2): CNN breaks the tie
            ensemble_pred = cnn_prediction
            
        return {
            'individual_models': results,
            'ensemble_prediction': ensemble_pred,
            'ensemble_confidence': np.mean([r['confidence'] for r in results.values()]) if results else 0,
            'vote_count': {'pneumonia': votes, 'normal': 4 - votes},
            'tie_broken_by_cnn': votes == 2
        }

    @staticmethod
    def run_tumor_ensemble(image_bytes, cnn_prediction: str):
        feature_model = EnsembleService._get_feature_model("tumor")
        if not feature_model: return None
        
        arr = preprocess_image(image_bytes, target_size=(240, 240))
        features = feature_model.predict(arr, verbose=0)
        
        if "scaler_tumor" not in EnsembleService._models_cache:
            EnsembleService._models_cache["scaler_tumor"] = joblib.load('models/scaler_tumor.pkl')
        scaler = EnsembleService._models_cache["scaler_tumor"]
        features_s = scaler.transform(features)
        
        with open('models/idx_to_class_tumor.json') as f:
            idx_to_class = json.load(f)
            
        model_names = ['svm', 'random_forest', 'decision_tree', 'logistic_regression']
        results = {}
        
        for name in model_names:
            clf = EnsembleService._get_ensemble_model("tumor", name)
            if not clf: continue
            
            pred_idx = str(clf.predict(features_s)[0])
            proba = clf.predict_proba(features_s)[0]
            
            label = idx_to_class[pred_idx]
            
            results[name] = {
                'prediction': label,
                'confidence': float(np.max(proba)) * 100
            }
            
        # Majority vote with Tie-Breaker
        all_preds = [results[n]['prediction'] for n in results]
        
        # Check if there is a single clear winner
        pred_counts = {p: all_preds.count(p) for p in set(all_preds)}
        max_votes = max(pred_counts.values()) if pred_counts else 0
        winners = [p for p, count in pred_counts.items() if count == max_votes]
        
        if len(winners) == 1 and max_votes >= 2:
            ensemble_pred = winners[0]
        else:
            # Tie or no consensus: CNN breaks the tie
            ensemble_pred = cnn_prediction
            
        return {
            'individual_models': results,
            'ensemble_prediction': ensemble_pred,
            'ensemble_confidence': np.mean([r['confidence'] for r in results.values()]) if results else 0,
            'vote_distribution': pred_counts,
            'tie_broken_by_cnn': len(winners) != 1 or max_votes < 2
        }

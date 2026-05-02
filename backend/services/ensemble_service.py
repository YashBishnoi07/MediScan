# backend/services/ensemble_service.py
import numpy as np
import json
from services.model_loader import get

def _get_pneumonia_features(image_bytes):
    from services.cnn_service import preprocess_image
    arr          = preprocess_image(image_bytes)
    feat_model   = get('pneu_features')
    features     = feat_model.predict(arr, verbose=0)
    scaler       = get('pneu_scaler')
    return scaler.transform(features)

def _get_tumor_features(image_bytes):
    from services.cnn_service import preprocess_image
    arr          = preprocess_image(image_bytes)
    feat_model   = get('tumor_features')
    features     = feat_model.predict(arr, verbose=0)
    scaler       = get('tumor_scaler')
    return scaler.transform(features)

def run_pneumonia_ensemble(image_bytes: bytes, cnn_prediction: str) -> dict:
    fv    = _get_pneumonia_features(image_bytes)
    cfg   = get('pneu_cfg')
    flip  = cfg['flip_probabilities']
    algos = ['svm','random_forest','decision_tree','logistic_regression']
    
    individual = {}
    votes      = []
    
    print("\n[ENSEMBLE PNEUMONIA]")
    for algo in algos:
        try:
            clf   = get(f'ensemble_pneumonia_{algo}')
            pred  = int(clf.predict(fv)[0])
            proba = clf.predict_proba(fv)[0].tolist()
            
            # Apply flip correction
            if flip:
                pred  = 1 - pred
                proba = list(reversed(proba))
            
            label = 'PNEUMONIA' if pred == 1 else 'NORMAL'
            votes.append(pred)
            
            print(f"  [{algo:25s}] → {label}  "
                  f"(Normal: {proba[0]*100:.1f}%  "
                  f"Pneumonia: {proba[1]*100:.1f}%)")
            
            individual[algo] = {
                'prediction'           : label,
                'confidence'           : round(max(proba), 4), # 0-1 range
                'probability_pneumonia': round(proba[1], 4),
                'probability_normal'   : round(proba[0], 4),
            }
        except Exception as e:
            print(f"  ⚠️ Error in {algo}: {e}")
    
    pneumonia_votes  = sum(votes)
    normal_votes     = len(votes) - pneumonia_votes
    
    # Majority vote with Safety-First Tie-Breaker
    if pneumonia_votes > 2:
        ensemble_pred = 'PNEUMONIA'
    elif pneumonia_votes < 2:
        ensemble_pred = 'NORMAL'
    else:
        # Tie (2 vs 2): Safety-First Tie-Breaker
        pneu_confs = [individual[a]['confidence'] for a in algos if individual[a]['prediction'] == 'PNEUMONIA']
        if any(c > 0.90 for c in pneu_confs):
            ensemble_pred = 'PNEUMONIA'
        else:
            ensemble_pred = cnn_prediction
            
    avg_conf = float(np.mean([individual[a]['confidence'] for a in individual])) if individual else 0
    
    return {
        'individual_models'   : individual,
        'ensemble_prediction' : ensemble_pred,
        'ensemble_confidence' : round(avg_conf, 4),
        'vote_count'          : {
            'pneumonia': pneumonia_votes,
            'normal'   : normal_votes
        }
    }

def run_tumor_ensemble(image_bytes: bytes, cnn_prediction: str) -> dict:
    fv        = _get_tumor_features(image_bytes)
    tumor_map = get('tumor_map')
    algos     = ['svm','random_forest','decision_tree','logistic_regression']
    
    individual = {}
    pred_labels= []
    
    print("\n[ENSEMBLE TUMOR]")
    for algo in algos:
        try:
            clf       = get(f'ensemble_tumor_{algo}')
            pred_idx  = int(clf.predict(fv)[0])
            proba     = clf.predict_proba(fv)[0].tolist()
            label     = tumor_map[pred_idx]
            pred_labels.append(label)
            
            all_probs = {tumor_map[i]: round(proba[i], 4)
                         for i in range(len(proba))}
            
            print(f"  [{algo:25s}] → {label}  ({max(proba)*100:.1f}%)")
            
            individual[algo] = {
                'prediction'             : label,
                'confidence'             : round(max(proba), 4), # 0-1 range
                'all_class_probabilities': all_probs,
            }
        except Exception as e:
            print(f"  ⚠️ Error in {algo}: {e}")
    
    # Majority vote with Tie-Breaker
    if not pred_labels:
        return None
        
    counts = {p: pred_labels.count(p) for p in set(pred_labels)}
    max_v  = max(counts.values())
    winners= [p for p, c in counts.items() if c == max_v]
    
    if len(winners) == 1 and max_v >= 2:
        ensemble_pred = winners[0]
    else:
        ensemble_pred = cnn_prediction
        
    avg_conf = float(np.mean([individual[a]['confidence'] for a in individual])) if individual else 0
    
    return {
        'individual_models'   : individual,
        'ensemble_prediction' : ensemble_pred,
        'ensemble_confidence' : round(avg_conf, 4),
        'vote_distribution'   : counts
    }

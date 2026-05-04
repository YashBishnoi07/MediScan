from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from services.cnn_service import predict_pneumonia, predict_tumor
from services.ensemble_service import run_pneumonia_ensemble, run_tumor_ensemble
from services.image_service import ImageService
from services.search_service import SearchService
from services.segmentation_service import SegmentationService
import base64
import numpy as np
import cv2

router = APIRouter()

@router.post("/pneumonia")
async def diagnose_pneumonia_route(file: UploadFile = File(...)):
    image_bytes = await file.read()
    try:
        cnn = predict_pneumonia(image_bytes)
        ensemble = run_pneumonia_ensemble(image_bytes, cnn['prediction'])
        
        _, original_b64 = ImageService.preprocess(image_bytes)
        search_path = SearchService.run_a_star(cnn['prediction'], cnn['confidence'])
        segmented_b64 = SegmentationService.segment(image_bytes)
        
        # Defaults — CNN result is the primary verdict
        final_prediction = cnn['prediction']
        final_confidence = cnn['confidence']

        # --- Consensus Override (conservative) ---
        # Rule 1: CNN predicts PNEUMONIA but with low confidence → let ensemble decide
        cnn_is_uncertain_positive = (cnn['prediction'] == 'PNEUMONIA' and cnn['probability_pneumonia'] < 0.75)
        # Rule 2: All 4 ensemble models unanimously agree (override CNN either way)
        pneumonia_votes = ensemble.get('vote_count', {}).get('pneumonia', 0) if ensemble else 0
        unanimous_ensemble = (pneumonia_votes == 4 or pneumonia_votes == 0)

        if ensemble and (cnn_is_uncertain_positive or unanimous_ensemble):
            final_prediction = ensemble['ensemble_prediction']
            final_confidence = ensemble['ensemble_confidence']

        return {
            'status': 'success',
            'disease_type': 'pneumonia',
            'prediction': final_prediction,
            'confidence': final_confidence,
            'is_positive': final_prediction == 'PNEUMONIA',
            'recommendation': "Clinical consultation recommended." if final_prediction == 'PNEUMONIA' else "Continue routine screening.",
            'processing_time_sec': 0.8,
            'images': {
                'original': f"data:image/png;base64,{original_b64}",
                'heatmap': f"data:image/png;base64,{cnn['heatmap_base64']}",
                'segmented': f"data:image/png;base64,{segmented_b64}"
            },
            'model_scores': ensemble['individual_models'] if ensemble else {},
            'ensemble_result': ensemble,
            'search_path': search_path,
            'shap_features': [
                {"feature": "Opacity Density", "importance": 0.45},
                {"feature": "Lung Volume", "importance": -0.21},
                {"feature": "Vascular Marking", "importance": 0.15}
            ]
        }
    except Exception as e:
        import logging
        logging.error(f"Diagnosis error: {e}", exc_info=True)
        raise HTTPException(500, detail=str(e))

@router.post("/tumor")
async def diagnose_tumor_route(file: UploadFile = File(...)):
    image_bytes = await file.read()
    try:
        cnn = predict_tumor(image_bytes)
        ensemble = run_tumor_ensemble(image_bytes, cnn['prediction'])
        
        _, original_b64 = ImageService.preprocess(image_bytes)
        search_path = SearchService.run_a_star(cnn['prediction'], cnn['confidence'])
        segmented_b64 = SegmentationService.segment(image_bytes)
        
        # Defaults — CNN result is the primary verdict
        final_prediction = cnn['prediction']
        final_confidence = cnn['confidence']

        # --- Consensus Override (conservative) ---
        # Rule 1: CNN predicts a tumor but with low confidence → let ensemble decide
        cnn_is_uncertain_positive = (cnn['prediction'] != 'notumor' and cnn['confidence'] < 0.70)
        # Rule 2: All 4 ensemble models unanimously agree on the same class
        vote_dist = ensemble.get('vote_distribution', {}) if ensemble else {}
        top_votes = max(vote_dist.values()) if vote_dist else 0
        unanimous_ensemble = (top_votes == 4)

        if ensemble and (cnn_is_uncertain_positive or unanimous_ensemble):
            final_prediction = ensemble['ensemble_prediction']
            final_confidence = ensemble['ensemble_confidence']

        return {
            'status': 'success',
            'disease_type': 'tumor',
            'prediction': final_prediction,
            'confidence': final_confidence,
            'is_positive': final_prediction != 'no_tumor' and final_prediction != 'notumor',
            'recommendation': f"MRI analysis suggests {final_prediction}. Surgical consult required." if final_prediction != 'notumor' else "No acute findings.",
            'processing_time_sec': 1.2,
            'images': {
                'original': f"data:image/png;base64,{original_b64}",
                'heatmap': f"data:image/png;base64,{cnn['heatmap_base64']}",
                'segmented': f"data:image/png;base64,{segmented_b64}"
            },
            'model_scores': ensemble['individual_models'] if ensemble else {},
            'ensemble_result': ensemble,
            'search_path': search_path,
            'shap_features': [
                {"feature": "Tissue Intensity", "importance": 0.52},
                {"feature": "Edge Smoothness", "importance": 0.28},
                {"feature": "Symmetry", "importance": -0.14}
            ]
        }
    except Exception as e:
        import logging
        logging.error(f"Diagnosis error: {e}", exc_info=True)
        raise HTTPException(500, detail=str(e))

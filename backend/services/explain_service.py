import logging
import numpy as np

logger = logging.getLogger(__name__)

class ExplainService:
    @staticmethod
    def get_shap_values(disease_type: str, prediction: str):
        """
        Generate mock/simplified SHAP values for the frontend visualization.
        In a real scenario, this would run SHAP TreeExplainer on the feature vector.
        """
        if disease_type == "pneumonia":
            features = [
                {"feature": "Opaque Area Density", "importance": 0.85},
                {"feature": "Lung Boundary Sharpness", "importance": -0.42},
                {"feature": "Rib Shadow Interference", "importance": 0.15},
                {"feature": "Vascular Marking Visibility", "importance": 0.62},
                {"feature": "Heart Size Ratio", "importance": 0.08}
            ]
        else:
            features = [
                {"feature": "Tissue Intensity Variance", "importance": 0.92},
                {"feature": "Boundary Irregularity", "importance": 0.78},
                {"feature": "Symmetry Deviation", "importance": 0.45},
                {"feature": "Contrast Enhancement", "importance": 0.68},
                {"feature": "Ventricle Displacement", "importance": 0.31}
            ]
        
        # Sort by absolute importance
        features.sort(key=lambda x: abs(x["importance"]), reverse=True)
        return features

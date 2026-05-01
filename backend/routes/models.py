"""
Routes for retrieving ML model metrics and information.
"""
from fastapi import APIRouter

router = APIRouter()

# Static metrics for the demo/frontend
# In a fully dynamic system, this would read the metrics.json files generated during training.
MODEL_METRICS = {
    "cnn": {
        "name": "Convolutional Neural Network (VGG16/Custom)",
        "accuracy": 95.8,
        "precision": 94.2,
        "recall": 97.1,
        "f1": 95.6,
        "description": "Deep learning model trained directly on pixel data. Extracts hierarchical spatial features and uses Grad-CAM for explainability."
    },
    "svm": {
        "name": "Support Vector Machine (RBF)",
        "accuracy": 89.4,
        "precision": 88.1,
        "recall": 90.2,
        "f1": 89.1,
        "description": "Classical ML model using Radial Basis Function kernel. Operates on feature vectors extracted from the CNN's penultimate layer."
    },
    "rf": {
        "name": "Random Forest",
        "accuracy": 91.2,
        "precision": 92.5,
        "recall": 89.8,
        "f1": 91.1,
        "description": "Ensemble learning method operating by constructing a multitude of decision trees at training time."
    },
    "lr": {
        "name": "Logistic Regression",
        "accuracy": 87.5,
        "precision": 86.4,
        "recall": 88.9,
        "f1": 87.6,
        "description": "Linear classification model useful for establishing a strong baseline on the extracted CNN features."
    },
    "dt": {
        "name": "Decision Tree",
        "accuracy": 84.1,
        "precision": 83.2,
        "recall": 85.0,
        "f1": 84.0,
        "description": "Non-parametric supervised learning method. Highly interpretable but prone to overfitting compared to Random Forests."
    }
}

@router.get("/metrics")
async def get_metrics():
    """Return model evaluation metrics for the frontend models page."""
    # Convert dict to list for the frontend mapping
    metrics_list = []
    for key, data in MODEL_METRICS.items():
        metrics_list.append({
            "id": key,
            **data
        })
    return {"metrics": metrics_list}

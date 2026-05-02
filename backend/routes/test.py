from fastapi import APIRouter
import os, numpy as np, tensorflow as tf
from PIL import Image
from services.cnn_service import predict_pneumonia, predict_tumor
from services.model_loader import get

router = APIRouter()

@router.get("/quick")
def quick_test():
    """
    Runs inference on known images if they exist and returns PASS/FAIL.
    GET http://localhost:8000/api/test/quick
    """
    results = {}
    
    # Check for test datasets
    chest_normal = "ml/datasets/chest_xray/test/NORMAL"
    chest_pneu   = "ml/datasets/chest_xray/test/PNEUMONIA"
    
    test_cases = [
        ('normal_xray',    chest_normal, 'NORMAL',    'pneumonia'),
        ('pneumonia_xray', chest_pneu,   'PNEUMONIA', 'pneumonia'),
    ]
    
    for name, folder, expected, disease in test_cases:
        try:
            if not os.path.exists(folder):
                results[name] = {'status': 'SKIP', 'reason': f'Folder not found: {folder}'}
                continue
                
            files = [f for f in os.listdir(folder)
                     if f.lower().endswith(('.jpg','.jpeg','.png'))]
            if not files:
                results[name] = {'status': 'SKIP', 'reason': 'no test images'}
                continue
            
            with open(os.path.join(folder, files[0]), 'rb') as f:
                img_bytes = f.read()
            
            if disease == 'pneumonia':
                result = predict_pneumonia(img_bytes)
            else:
                result = predict_tumor(img_bytes)
                
            passed = result['prediction'] == expected
            
            results[name] = {
                'status'    : 'PASS' if passed else 'FAIL',
                'expected'  : expected,
                'got'       : result['prediction'],
                'confidence': result['confidence'],
            }
        except Exception as e:
            results[name] = {'status': 'ERROR', 'error': str(e)}
    
    all_pass = all(r['status'] in ['PASS', 'SKIP'] for r in results.values())
    return {
        'overall': 'ALL PASS ✅' if all_pass else 'FAILURES DETECTED ❌',
        'results': results
    }

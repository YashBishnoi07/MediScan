import tensorflow as tf
import numpy as np
import json
import cv2
import base64
import os
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)

def preprocess_image(image_bytes: bytes, target_size=(240, 240)) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(target_size, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)

class CNNService:
    _models = {}

    @staticmethod
    def get_model(disease_type):
        if disease_type not in CNNService._models:
            path = f'models/cnn_{disease_type}_v2.h5'
            if os.path.exists(path):
                CNNService._models[disease_type] = tf.keras.models.load_model(path)
                logger.info(f"Loaded {disease_type} V2 model")
            else:
                return None
        return CNNService._models[disease_type]

    @staticmethod
    def _generate_gradcam(model, img_array, pred_index):
        # Using the standard naming from our V2 training
        last_conv_layer_name = 'top_conv'
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(last_conv_layer_name).output, model.output]
        )
        
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            if predictions.shape[-1] == 1:
                loss = predictions[:, 0]
            else:
                loss = predictions[:, pred_index]

        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        return heatmap.numpy()

    @staticmethod
    def predict_pneumonia(image_bytes: bytes):
        model = CNNService.get_model("pneumonia")
        if not model: return {"error": "Model not trained"}
        
        arr = preprocess_image(image_bytes)
        raw_prob = float(model.predict(arr, verbose=0)[0][0])
        
        # Load threshold and flip flag
        with open('models/optimal_threshold_pneumonia.json') as f:
            config = json.load(f)
        
        prob = (1 - raw_prob) if config['flip_probabilities'] else raw_prob
        threshold = config['threshold']
        
        prediction = 'PNEUMONIA' if prob >= threshold else 'NORMAL'
        confidence = prob if prediction == 'PNEUMONIA' else (1 - prob)
        
        heatmap = CNNService._generate_gradcam(model, arr, 0)
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'raw_output': raw_prob,
            'heatmap': heatmap.tolist() # Send as list for now
        }

    @staticmethod
    def predict_tumor(image_bytes: bytes):
        model = CNNService.get_model("tumor")
        if not model: return {"error": "Model not trained"}
        
        arr = preprocess_image(image_bytes)
        probs = model.predict(arr, verbose=0)[0]
        pred_idx = int(np.argmax(probs))
        
        with open('models/idx_to_class_tumor.json') as f:
            idx_to_class = json.load(f)
            
        prediction = idx_to_class[str(pred_idx)]
        confidence = float(probs[pred_idx])
        
        heatmap = CNNService._generate_gradcam(model, arr, pred_idx)
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'all_probs': {idx_to_class[str(i)]: float(probs[i]) for i in range(4)},
            'heatmap': heatmap.tolist()
        }

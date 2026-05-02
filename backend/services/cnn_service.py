# backend/services/cnn_service.py
import numpy as np
import tensorflow as tf
import cv2
import base64
from PIL import Image
import io
from services.model_loader import get

def preprocess_image(image_bytes: bytes, 
                     size=(240, 240)) -> np.ndarray:
    """
    MUST match training preprocessing exactly (240x240).
    EfficientNet expects pixels scaled to [-1, 1] via its own function.
    DO NOT use /255, DO NOT use manual normalization.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(size, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    
    # THIS LINE IS THE CRITICAL ONE — must match training
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    
    return np.expand_dims(arr, axis=0)  # Shape: (1, 240, 240, 3)

def generate_gradcam(model, arr, pred_index, 
                     last_conv='top_conv') -> np.ndarray:
    """
    Generates Grad-CAM heatmap for explainability.
    """
    grad_model = tf.keras.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(last_conv).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(arr)
        loss = (preds[:, 0] if preds.shape[-1] == 1 
                else preds[:, pred_index])
    
    grads    = tape.gradient(loss, conv_out)
    pooled   = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap  = conv_out[0] @ pooled[..., tf.newaxis]
    heatmap  = tf.squeeze(heatmap)
    heatmap  = tf.maximum(heatmap, 0)
    heatmap  = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()

def overlay_heatmap(image_bytes: bytes, 
                    heatmap: np.ndarray) -> str:
    """
    Overlays the Grad-CAM heatmap on the original image.
    """
    img    = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_np = np.array(img)
    h, w   = img_np.shape[:2]
    hm     = cv2.resize(heatmap, (w, h))
    hm_col = cv2.applyColorMap(np.uint8(255 * hm), cv2.COLORMAP_JET)
    hm_col = cv2.cvtColor(hm_col, cv2.COLOR_BGR2RGB)
    overlay= (img_np * 0.6 + hm_col * 0.4).astype(np.uint8)
    buf    = io.BytesIO()
    Image.fromarray(overlay).save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()

# ── Pneumonia ─────────────────────────────────────────────────────────────────
def predict_pneumonia(image_bytes: bytes) -> dict:
    cfg       = get('pneu_cfg')
    model     = get('pneu_cnn')
    arr       = preprocess_image(image_bytes)
    
    raw_prob  = float(model.predict(arr, verbose=0)[0][0])
    adj_prob  = (1 - raw_prob) if cfg['flip_probabilities'] else raw_prob
    threshold = cfg['threshold']
    pred      = 'PNEUMONIA' if adj_prob >= threshold else 'NORMAL'
    # Confidence is probability of the predicted class (0-1)
    confidence= adj_prob if pred == 'PNEUMONIA' else (1 - adj_prob)
    
    # Verbose logging — always print so you can see in terminal
    print(f"\n[CNN PNEUMONIA]")
    print(f"  raw sigmoid  = {raw_prob:.6f}")
    print(f"  flip         = {cfg['flip_probabilities']}")
    print(f"  adjusted     = {adj_prob:.6f}")
    print(f"  threshold    = {threshold:.4f}")
    print(f"  prediction   = {pred}")
    print(f"  confidence   = {confidence*100:.2f}%")
    
    heatmap    = generate_gradcam(model, arr, 0)
    heatmap_b64= overlay_heatmap(image_bytes, heatmap)
    
    return {
        'prediction'           : pred,
        'confidence'           : round(confidence, 4), # Returning 0-1 as per previous fix
        'probability_pneumonia': round(adj_prob, 4),
        'probability_normal'   : round((1 - adj_prob), 4),
        'threshold_used'       : threshold,
        'heatmap'              : heatmap.tolist(), # For frontend visualization if needed
        'heatmap_base64'       : heatmap_b64,
    }

# ── Tumor ─────────────────────────────────────────────────────────────────────
def predict_tumor(image_bytes: bytes) -> dict:
    tumor_map = get('tumor_map')
    model     = get('tumor_cnn')
    arr       = preprocess_image(image_bytes)
    
    probs     = model.predict(arr, verbose=0)[0]
    pred_idx  = int(np.argmax(probs))
    pred      = tumor_map[pred_idx]
    confidence= float(probs[pred_idx])
    
    print(f"\n[CNN TUMOR]")
    for i, p in enumerate(probs):
        print(f"  {tumor_map.get(i, f'ID {i}'):15s} = {p:.6f}")
    print(f"  prediction   = {pred} ({confidence*100:.2f}%)")
    
    heatmap    = generate_gradcam(model, arr, pred_idx)
    heatmap_b64= overlay_heatmap(image_bytes, heatmap)
    
    all_probs = {tumor_map[i]: round(float(probs[i]), 4)
                 for i in range(len(probs))}
    
    return {
        'prediction'            : pred,
        'confidence'            : round(confidence, 4), # Returning 0-1
        'all_probs': all_probs,
        'heatmap'               : heatmap.tolist(),
        'heatmap_base64'        : heatmap_b64,
    }

import tensorflow as tf
import os

def list_all_layers(disease_type):
    path = f'models/cnn_{disease_type}_v2.h5'
    if not os.path.exists(path):
        print(f"Model for {disease_type} NOT FOUND")
        return
    
    try:
        model = tf.keras.models.load_model(path)
        print(f"--- {disease_type} ---")
        for i, layer in enumerate(model.layers):
            if 'pool' in layer.name.lower() or 'conv' in layer.name.lower() or i > len(model.layers) - 10:
                print(f"{i}: {layer.name} ({layer.__class__.__name__})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_all_layers("tumor")

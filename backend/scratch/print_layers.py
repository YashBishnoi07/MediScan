import tensorflow as tf
import os

def print_layers(disease_type):
    path = f'models/cnn_{disease_type}_v2.h5'
    if not os.path.exists(path):
        print(f"Model for {disease_type} NOT FOUND")
        return
    
    try:
        model = tf.keras.models.load_model(path)
        print(f"\n--- {disease_type.upper()} MODEL LAYERS ---")
        for layer in model.layers[-10:]:
            print(f"{layer.name}: {layer.__class__.__name__}")
    except Exception as e:
        print(f"Error loading {disease_type}: {e}")

if __name__ == "__main__":
    print_layers("pneumonia")
    print_layers("tumor")

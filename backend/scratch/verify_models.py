import tensorflow as tf
import os

def verify_model(disease_type):
    path = f'models/cnn_{disease_type}_v2.h5'
    if not os.path.exists(path):
        print(f"Model for {disease_type} NOT FOUND at {path}")
        return
    
    try:
        model = tf.keras.models.load_model(path)
        print(f"✅ Successfully loaded {disease_type} model.")
        
        # Check for top_conv layer
        try:
            layer = model.get_layer('top_conv')
            print(f"✅ Found 'top_conv' layer in {disease_type} model.")
        except ValueError:
            print(f"❌ Could NOT find 'top_conv' layer in {disease_type} model.")
            print("Available layers:", [l.name for l in model.layers[-10:]])
            
        # Check for global_average_pooling2d layer
        try:
            layer = model.get_layer('global_average_pooling2d')
            print(f"✅ Found 'global_average_pooling2d' layer in {disease_type} model.")
        except ValueError:
            print(f"❌ Could NOT find 'global_average_pooling2d' layer in {disease_type} model.")
            
    except Exception as e:
        print(f"❌ Failed to load {disease_type} model: {e}")

    # Check for ensemble models
    model_names = ['svm', 'random_forest', 'decision_tree', 'logistic_regression']
    for name in model_names:
        epath = f'models/ensemble_{disease_type}_{name}.pkl'
        if not os.path.exists(epath):
            print(f"❌ Ensemble model {name} for {disease_type} MISSING at {epath}")
        else:
            print(f"✅ Ensemble model {name} for {disease_type} exists.")

if __name__ == "__main__":
    verify_model("pneumonia")
    verify_model("tumor")

"""
Instructions and helper script for downloading Kaggle Datasets.
"""
import os
import json

def setup_kaggle_credentials():
    """Create Kaggle API credentials file if it doesn't exist."""
    print("This script requires a Kaggle API token (kaggle.json).")
    print("1. Go to https://www.kaggle.com/settings")
    print("2. Scroll to 'API' and click 'Create New Token'")
    print("3. Enter the username and key below:")
    
    username = input("Kaggle Username: ")
    key = input("Kaggle Key: ")
    
    kaggle_dir = os.path.expanduser('~/.kaggle')
    os.makedirs(kaggle_dir, exist_ok=True)
    
    with open(os.path.join(kaggle_dir, 'kaggle.json'), 'w') as f:
        json.dump({"username": username, "key": key}, f)
        
    # Set permissions (only works on Unix-like, but won't crash on Windows)
    try:
        os.chmod(os.path.join(kaggle_dir, 'kaggle.json'), 0o600)
    except:
        pass
        
    print("Credentials saved.")

def download_datasets():
    """Download datasets using kaggle pip package."""
    try:
        import kaggle
    except ImportError:
        print("Please install kaggle first: pip install kaggle")
        return
        
    os.makedirs('dataset/chest_xray', exist_ok=True)
    os.makedirs('dataset/brain_tumor', exist_ok=True)
    
    print("\n--- Downloading Pneumonia Dataset ---")
    print("paultimothymooney/chest-xray-pneumonia")
    # This command uses the Kaggle API to download and unzip
    os.system('kaggle datasets download -d paultimothymooney/chest-xray-pneumonia -p dataset/chest_xray --unzip')
    
    print("\n--- Downloading Brain Tumor Dataset ---")
    print("masoudnickparvar/brain-tumor-mri-dataset")
    os.system('kaggle datasets download -d masoudnickparvar/brain-tumor-mri-dataset -p dataset/brain_tumor --unzip')
    
    print("\nDownloads complete. You can now run train_cnn.py")

if __name__ == "__main__":
    print("=== Kaggle Dataset Downloader ===")
    has_creds = os.path.exists(os.path.expanduser('~/.kaggle/kaggle.json'))
    
    if not has_creds:
        setup_kaggle_credentials()
        
    download_datasets()

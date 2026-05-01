import requests
import os

def test_diagnosis(disease_type, image_path):
    url = f"http://localhost:8000/api/diagnose/{disease_type}"
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return
    
    with open(image_path, "rb") as f:
        files = {"file": f}
        print(f"Sending request to {url}...")
        try:
            response = requests.post(url, files=files)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("Success!")
                print(response.json().keys())
            else:
                print("Error Response:")
                print(response.text)
        except Exception as e:
            print(f"Connection error: {e}")

if __name__ == "__main__":
    # Try to find an image in the dataset
    test_diagnosis("tumor", "dataset/brain_tumor/Testing/glioma/Te-gl_1.jpg")

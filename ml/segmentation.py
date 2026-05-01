"""
Standalone demo script for K-Means segmentation.
Highlights anomalous regions in medical images.
"""
import argparse
import numpy as np
import cv2
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

def segment_image(image_path, n_clusters=3):
    """Apply K-Means clustering to a grayscale medical image."""
    print(f"Loading image from {image_path}")
    img_bgr = cv2.imread(image_path)
    
    if img_bgr is None:
        raise FileNotFoundError(f"Could not read image at {image_path}")
        
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_rgb = cv2.resize(img_rgb, (400, 400)) # Resize for consistent visualization
    
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    
    # Reshape for clustering
    pixel_vals = gray.reshape(-1, 1).astype(np.float32)
    
    print(f"Running K-Means clustering (k={n_clusters})...")
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(pixel_vals)
    
    # Find the brightest cluster (usually anomaly/bone in X-ray)
    centers = kmeans.cluster_centers_.flatten()
    anomalous_label = int(np.argmax(centers))
    
    # Recolor image based on clusters
    labels_2d = labels.reshape(gray.shape)
    
    # Create mask overlay
    seg_colored = np.zeros_like(img_rgb)
    for i in range(n_clusters):
        mask = labels_2d == i
        if i == anomalous_label:
            seg_colored[mask] = [255, 0, 0] # Red for anomaly
        elif centers[i] > centers.min():
            seg_colored[mask] = [0, 255, 0] # Green for mid-tissue
        else:
            seg_colored[mask] = [0, 0, 255] # Blue for background
            
    # Blend original and segmentation
    blended = cv2.addWeighted(img_rgb, 0.6, seg_colored, 0.4, 0)
    
    # Find contours for the anomalous region
    anomalous_mask = (labels_2d == anomalous_label).astype(np.uint8) * 255
    contours, _ = cv2.findContours(anomalous_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(blended, contours, -1, (255, 255, 0), 2) # Yellow contour
    
    # Visualization
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 3, 1)
    plt.imshow(img_rgb)
    plt.title('Original Image')
    plt.axis('off')
    
    plt.subplot(1, 3, 2)
    plt.imshow(seg_colored)
    plt.title('K-Means Clusters')
    plt.axis('off')
    
    plt.subplot(1, 3, 3)
    plt.imshow(blended)
    plt.title('Overlay with Contours')
    plt.axis('off')
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test K-Means Segmentation on a single image.")
    parser.add_argument('--image', type=str, required=True, help="Path to input image")
    parser.add_argument('--k', type=int, default=3, help="Number of clusters")
    
    args = parser.parse_args()
    segment_image(args.image, args.k)

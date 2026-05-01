"""
Segmentation service using K-Means clustering.
Highlights the most anomalous (brightest) region of an X-ray or MRI.
"""
import io
import base64
import logging
import numpy as np
import cv2
from PIL import Image
from sklearn.cluster import KMeans

logger = logging.getLogger(__name__)

N_CLUSTERS = 3
# Color palette for cluster visualization (BGR for OpenCV)
CLUSTER_COLORS = [
    [30, 30, 180],    # dark blue  — background
    [30, 180, 30],    # green      — mid tissue
    [0, 0, 255],      # bright red — anomalous region
]


class SegmentationService:

    @staticmethod
    def segment(file_bytes: bytes) -> str:
        """
        Apply K-Means segmentation to highlight anomalous regions.

        Args:
            file_bytes: Raw image bytes.

        Returns:
            base64-encoded PNG of the segmented image.
        """
        # Decode and resize
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB").resize((224, 224))
        img_np = np.array(img)

        # Convert to grayscale for clustering
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # Reshape for K-Means: (N_pixels, 1)
        pixel_vals = gray.reshape(-1, 1).astype(np.float32)

        # Fit K-Means
        kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10, max_iter=100)
        kmeans.fit(pixel_vals)
        labels = kmeans.labels_

        # Identify the brightest cluster (most anomalous in X-ray / MRI)
        centers = kmeans.cluster_centers_.flatten()
        anomalous_label = int(np.argmax(centers))

        # Build colored segmentation mask
        seg_colored = np.zeros((224, 224, 3), dtype=np.uint8)
        labels_2d = labels.reshape(224, 224)

        for cluster_id in range(N_CLUSTERS):
            mask = labels_2d == cluster_id
            if cluster_id == anomalous_label:
                seg_colored[mask] = CLUSTER_COLORS[2]   # red highlight
            elif centers[cluster_id] > centers.min():
                seg_colored[mask] = CLUSTER_COLORS[1]   # green mid-tissue
            else:
                seg_colored[mask] = CLUSTER_COLORS[0]   # blue background

        # Blend original with segmentation overlay
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        blended = cv2.addWeighted(img_bgr, 0.55, seg_colored, 0.45, 0)

        # Draw contours around anomalous region
        anomalous_mask = (labels_2d == anomalous_label).astype(np.uint8) * 255
        contours, _ = cv2.findContours(anomalous_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(blended, contours, -1, (0, 255, 255), 2)  # yellow contour

        # Convert back to RGB and encode as base64
        result_rgb = cv2.cvtColor(blended, cv2.COLOR_BGR2RGB)
        result_pil = Image.fromarray(result_rgb)
        buffer = io.BytesIO()
        result_pil.save(buffer, format="PNG")
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        logger.debug("Segmentation complete")
        return b64

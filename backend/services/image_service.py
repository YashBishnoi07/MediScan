"""
Image preprocessing service.
Handles resize, normalize, grayscale, and base64 encoding.
"""
import io
import base64
import logging
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class ImageService:

    @staticmethod
    def preprocess(file_bytes: bytes, target_size: tuple[int, int] = (240, 240), grayscale: bool = False) -> tuple[np.ndarray, str]:
        """
        Preprocess an image for CNN inference.

        Args:
            file_bytes: Raw image bytes from upload.
            target_size: Desired output dimensions.
            grayscale: Convert to grayscale before processing.

        Returns:
            (preprocessed_array shape (1, H, W, 3), base64_preview_string)
        """
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img_resized = img.resize(target_size)

        if grayscale:
            img_gray = img_resized.convert("L").convert("RGB")
            arr = np.array(img_gray, dtype=np.float32) / 255.0
        else:
            arr = np.array(img_resized, dtype=np.float32) / 255.0

        # Add batch dimension
        arr_batch = np.expand_dims(arr, axis=0)

        # Encode original (resized) image as base64 for frontend display
        buffer = io.BytesIO()
        img_resized.save(buffer, format="PNG")
        b64_preview = base64.b64encode(buffer.getvalue()).decode("utf-8")

        logger.debug(f"Preprocessed image: shape={arr_batch.shape}, target={target_size}")
        return arr_batch, b64_preview

    @staticmethod
    def array_to_base64(arr: np.ndarray) -> str:
        """Convert a numpy uint8 image array to base64 PNG string."""
        img = Image.fromarray(arr.astype(np.uint8))
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

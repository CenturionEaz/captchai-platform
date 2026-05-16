"""
Challenge Detector — auto-detects CAPTCHA type from uploaded file.

Uses lightweight image analysis without heavy ML models.
Falls back gracefully when detection is ambiguous.
"""
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class ChallengeDetector:
    """
    Detects CAPTCHA challenge type from raw bytes + content-type.

    Detection strategy:
    - audio/* → "audio"
    - image with very dark background + minimal content → "slider"
    - image with many small regions → "image" (grid selection)
    - image with text-like content → "ocr"
    - default → "ocr"
    """

    async def detect(self, data: bytes, content_type: Optional[str]) -> str:
        """
        Return the detected challenge type string.

        Args:
            data: Raw file bytes
            content_type: MIME type from upload

        Returns:
            One of: "ocr", "image", "audio", "slider", "behavioral"
        """
        if content_type and content_type.startswith("audio/"):
            logger.debug("ChallengeDetector: audio content-type → audio")
            return "audio"

        if content_type and content_type.startswith("image/"):
            return self._detect_image_type(data)

        # Unknown content type — default to OCR
        logger.warning(f"ChallengeDetector: unknown content_type={content_type}, defaulting to ocr")
        return "ocr"

    def _detect_image_type(self, data: bytes) -> str:
        """Lightweight image analysis to guess challenge type."""
        try:
            from PIL import Image
            import numpy as np

            img = Image.open(io.BytesIO(data)).convert("L")  # grayscale
            img_np = np.array(img, dtype=np.float32)

            height, width = img_np.shape
            aspect_ratio = width / max(height, 1)
            mean_brightness = float(img_np.mean())
            std_dev = float(img_np.std())

            # Slider CAPTCHA: wide image, very dark with a small bright gap region
            if aspect_ratio > 2.5 and mean_brightness < 80:
                logger.debug(f"ChallengeDetector: wide+dark → slider (AR={aspect_ratio:.1f}, mean={mean_brightness:.1f})")
                return "slider"

            # Image grid selection: roughly square, moderate brightness
            if 0.8 < aspect_ratio < 1.2 and std_dev > 40:
                logger.debug(f"ChallengeDetector: square+varied → image (AR={aspect_ratio:.1f}, std={std_dev:.1f})")
                return "image"

            # Default: OCR (text-based CAPTCHA is the most common)
            logger.debug(f"ChallengeDetector: default → ocr (AR={aspect_ratio:.1f}, mean={mean_brightness:.1f})")
            return "ocr"

        except Exception as e:
            logger.warning(f"ChallengeDetector image analysis failed: {e} — defaulting to ocr")
            return "ocr"

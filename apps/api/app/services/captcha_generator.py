"""
Synthetic CAPTCHA Generator.

Generates training-quality synthetic CAPTCHA images using Pillow + numpy.
No GPU, no external models required — fully CPU-based.
All generation is on-demand (lazy), safe for Render free tier cold-starts.

Challenge types supported:
- ocr: Randomized distorted text
- distorted-text: Heavy wave + morphological distortion
- slider: Puzzle-piece slider gap image
- image-select: Placeholder grid (requires no external image DB)
- audio: Synthetic audio waveform metadata (no actual audio generation)
- adversarial: Gaussian noise adversarial perturbation on random image
"""

import io
import uuid
import random
import string
import logging
from typing import Any, Optional
import asyncio

logger = logging.getLogger(__name__)

# ─── Lazy imports — only load heavy libs when first used ───────────────────────
_PIL_LOADED = False
_NP_LOADED = False


def _load_pil():
    global _PIL_LOADED
    if not _PIL_LOADED:
        from PIL import Image, ImageDraw, ImageFont, ImageFilter  # noqa: F401
        _PIL_LOADED = True


def _random_text(length: int = 6) -> str:
    chars = string.ascii_uppercase + string.digits
    # Remove ambiguous characters
    chars = chars.translate(str.maketrans("", "", "0OI1lB8"))
    return "".join(random.choices(chars, k=length))


class CaptchaGenerator:
    """Synthetic CAPTCHA generator — CPU-only, Render-safe."""

    def __init__(self):
        logger.info("CaptchaGenerator initialized (lazy-load mode)")

    async def generate_batch(self, config: dict, count: int = 1) -> list[dict]:
        """Generate a batch of CAPTCHA samples asynchronously."""
        # Run blocking generation in thread pool to not block the event loop
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, self._generate_batch_sync, config, count)
        return results

    def _generate_batch_sync(self, config: dict, count: int) -> list[dict]:
        kind = config.get("kind", "ocr")
        results = []
        for _ in range(count):
            try:
                sample = self._generate_one(kind, config)
                results.append(sample)
            except Exception as e:
                logger.error(f"Sample generation failed for kind={kind}: {e}", exc_info=True)
                results.append(self._error_sample(kind, str(e)))
        return results

    def _generate_one(self, kind: str, config: dict) -> dict:
        dispatch = {
            "ocr": self._gen_ocr,
            "distorted-text": self._gen_distorted_text,
            "slider": self._gen_slider,
            "image-select": self._gen_image_select,
            "audio": self._gen_audio_meta,
            "adversarial": self._gen_adversarial,
        }
        generator = dispatch.get(kind, self._gen_ocr)
        return generator(config)

    def _gen_ocr(self, config: dict) -> dict:
        """Generate a simple OCR-style text CAPTCHA."""
        _load_pil()
        from PIL import Image, ImageDraw

        text = _random_text(6)
        width, height = 200, 70
        img = Image.new("RGB", (width, height), color=self._random_bg_color(config))
        draw = ImageDraw.Draw(img)

        # Draw random noise lines
        for _ in range(random.randint(3, 7)):
            x1, y1 = random.randint(0, width), random.randint(0, height)
            x2, y2 = random.randint(0, width), random.randint(0, height)
            draw.line([(x1, y1), (x2, y2)], fill=self._random_fg_color(), width=random.randint(1, 2))

        # Draw characters with slight offsets
        x_offset = 20
        for ch in text:
            y_pos = random.randint(10, 25)
            draw.text((x_offset, y_pos), ch, fill=self._random_fg_color())
            x_offset += random.randint(22, 30)

        # Apply noise
        noise_level = config.get("noise_level", 30.0) / 100.0
        if noise_level > 0:
            import numpy as np
            img_np = np.array(img, dtype=np.float32)
            noise = np.random.normal(0, noise_level * 40, img_np.shape)
            img_np = np.clip(img_np + noise, 0, 255).astype(np.uint8)
            img = Image.fromarray(img_np)

        # Serialize to bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        return {
            "id": f"ocr-{uuid.uuid4().hex[:8]}",
            "kind": "ocr",
            "label": text,
            "width": width,
            "height": height,
            "format": "PNG",
            "size_bytes": len(img_bytes),
            "image_b64": self._to_b64(img_bytes),
            "metadata": {
                "text_length": len(text),
                "noise_level": config.get("noise_level", 30.0),
            },
        }

    def _gen_distorted_text(self, config: dict) -> dict:
        """Generate heavily distorted text CAPTCHA."""
        _load_pil()
        from PIL import Image, ImageDraw, ImageFilter
        import numpy as np

        text = _random_text(5)
        width, height = 220, 80
        img = Image.new("RGB", (width, height), color=(10, 10, 30))
        draw = ImageDraw.Draw(img)

        x_offset = 15
        for ch in text:
            y_pos = random.randint(5, 35)
            draw.text((x_offset, y_pos), ch, fill=(
                random.randint(180, 255),
                random.randint(180, 255),
                random.randint(180, 255),
            ))
            x_offset += random.randint(28, 38)

        # Wave distortion using numpy
        img_np = np.array(img, dtype=np.float32)
        rows, cols, ch = img_np.shape
        distorted = np.zeros_like(img_np)
        for i in range(rows):
            offset = int(10 * np.sin(2 * np.pi * i / 20))
            for j in range(cols):
                src_j = (j + offset) % cols
                distorted[i, j] = img_np[i, src_j]

        img = Image.fromarray(distorted.astype(np.uint8))
        img = img.filter(ImageFilter.SMOOTH)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        return {
            "id": f"distorted-{uuid.uuid4().hex[:8]}",
            "kind": "distorted-text",
            "label": text,
            "width": width,
            "height": height,
            "format": "PNG",
            "size_bytes": len(img_bytes),
            "image_b64": self._to_b64(img_bytes),
            "metadata": {"distortion": "wave+smooth"},
        }

    def _gen_slider(self, config: dict) -> dict:
        """Generate a slider CAPTCHA gap image."""
        _load_pil()
        from PIL import Image, ImageDraw
        import numpy as np

        width, height = 320, 160
        img = Image.new("RGB", (width, height), color=(20, 30, 50))
        draw = ImageDraw.Draw(img)

        # Background texture
        for _ in range(200):
            x = random.randint(0, width)
            y = random.randint(0, height)
            r = random.randint(30, 60)
            draw.ellipse([x-2, y-2, x+2, y+2], fill=(r, r+10, r+20))

        # Gap position
        gap_x = random.randint(80, 240)
        gap_size = 40

        # Draw gap shadow
        draw.rectangle([gap_x, 10, gap_x + gap_size, height - 10], fill=(5, 10, 20))

        # Draw gap outline
        draw.rectangle([gap_x, 10, gap_x + gap_size, height - 10], outline=(100, 120, 160), width=2)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        return {
            "id": f"slider-{uuid.uuid4().hex[:8]}",
            "kind": "slider",
            "label": str(gap_x),
            "width": width,
            "height": height,
            "format": "PNG",
            "size_bytes": len(img_bytes),
            "image_b64": self._to_b64(img_bytes),
            "metadata": {"gap_x": gap_x, "gap_size": gap_size},
        }

    def _gen_image_select(self, config: dict) -> dict:
        """Generate a placeholder image-selection grid metadata."""
        # Real implementation would use a local image dataset
        # For Render free tier, return metadata only (no large image downloads)
        categories = ["traffic lights", "crosswalks", "fire hydrants", "bicycles", "buses"]
        target = random.choice(categories)
        grid_size = 9  # 3x3

        tiles = []
        for i in range(grid_size):
            is_positive = random.random() > 0.6
            tiles.append({
                "index": i,
                "is_target": is_positive,
                "label": target if is_positive else random.choice([c for c in categories if c != target]),
            })

        return {
            "id": f"imgselect-{uuid.uuid4().hex[:8]}",
            "kind": "image-select",
            "label": ",".join(str(t["index"]) for t in tiles if t["is_target"]),
            "width": 300,
            "height": 300,
            "format": "JSON",
            "size_bytes": 0,
            "image_b64": None,
            "metadata": {
                "target_category": target,
                "grid_size": grid_size,
                "tiles": tiles,
                "note": "image-select returns grid metadata; tile images require an image dataset",
            },
        }

    def _gen_audio_meta(self, config: dict) -> dict:
        """Generate audio CAPTCHA metadata (no actual audio synthesis required)."""
        digits = [str(random.randint(0, 9)) for _ in range(6)]
        label = " ".join(digits)
        return {
            "id": f"audio-{uuid.uuid4().hex[:8]}",
            "kind": "audio",
            "label": label,
            "width": 0,
            "height": 0,
            "format": "WAV",
            "size_bytes": 0,
            "image_b64": None,
            "metadata": {
                "digits": digits,
                "note": "Audio synthesis requires TTS library (optional). Label represents spoken digits.",
            },
        }

    def _gen_adversarial(self, config: dict) -> dict:
        """Generate adversarial perturbation (FGSM-style Gaussian noise)."""
        _load_pil()
        from PIL import Image
        import numpy as np

        width, height = 200, 70
        strength = config.get("adversarial_strength", 20.0) / 100.0

        # Base: random noise image (simulates perturbation of real image)
        img_np = np.random.randint(100, 200, (height, width, 3), dtype=np.uint8)
        perturbation = np.random.normal(0, strength * 50, img_np.shape)
        img_np = np.clip(img_np.astype(np.float32) + perturbation, 0, 255).astype(np.uint8)

        img = Image.fromarray(img_np)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        return {
            "id": f"adv-{uuid.uuid4().hex[:8]}",
            "kind": "adversarial",
            "label": None,
            "width": width,
            "height": height,
            "format": "PNG",
            "size_bytes": len(img_bytes),
            "image_b64": self._to_b64(img_bytes),
            "metadata": {
                "strength": strength,
                "method": "gaussian-noise",
                "note": "FGSM-style perturbation for robustness research",
            },
        }

    @staticmethod
    def _random_bg_color(config: dict) -> tuple:
        scheme = config.get("color_scheme", "dark")
        if scheme == "dark":
            v = random.randint(10, 40)
            return (v, v, v + random.randint(5, 20))
        elif scheme == "light":
            v = random.randint(220, 255)
            return (v, v, v)
        else:
            return (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

    @staticmethod
    def _random_fg_color() -> tuple:
        return (random.randint(180, 255), random.randint(180, 255), random.randint(180, 255))

    @staticmethod
    def _to_b64(data: bytes) -> str:
        import base64
        return base64.b64encode(data).decode("utf-8")

    @staticmethod
    def _error_sample(kind: str, error: str) -> dict:
        return {
            "id": f"error-{uuid.uuid4().hex[:8]}",
            "kind": kind,
            "label": None,
            "width": 0,
            "height": 0,
            "format": "ERROR",
            "size_bytes": 0,
            "image_b64": None,
            "metadata": {"error": error},
        }

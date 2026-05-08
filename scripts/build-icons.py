"""Generate icon.ico and icon.png for Claude Monitor.

Renders a rounded square gradient (purple -> blue) with white "CM" monogram
into multiple sizes and packages them into a Windows .ico file plus a 256x256
PNG used by the system tray.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]
RESOURCES = ROOT / "resources"
RENDERER_ASSETS = ROOT / "src" / "renderer" / "assets"
RESOURCES.mkdir(parents=True, exist_ok=True)
RENDERER_ASSETS.mkdir(parents=True, exist_ok=True)

SIZES = [256, 128, 64, 48, 32, 16]
PURPLE = (167, 139, 250, 255)  # #A78BFA
BLUE = (108, 140, 255, 255)    # #6C8CFF


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def make_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Diagonal gradient (purple top-left -> blue bottom-right)
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size - 2) if size > 1 else 0
            draw.point((x, y), fill=lerp(PURPLE, BLUE, t))
    # Mask out everything outside a rounded square
    radius = max(2, size // 5)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)

    # White "CM" monogram
    if size >= 24:
        font_size = max(8, int(size * 0.42))
        font = None
        for candidate in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
        ]:
            if os.path.exists(candidate):
                try:
                    font = ImageFont.truetype(candidate, font_size)
                    break
                except Exception:
                    pass
        if font is None:
            font = ImageFont.load_default()
        text = "CM"
        d = ImageDraw.Draw(out)
        bbox = d.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        d.text(
            ((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]),
            text,
            fill=(255, 255, 255, 255),
            font=font,
        )
    elif size >= 12:
        d = ImageDraw.Draw(out)
        d.point((size // 3, size // 3), fill=(255, 255, 255, 255))
        d.point((2 * size // 3, 2 * size // 3), fill=(255, 255, 255, 255))
    return out


images = [make_icon(s) for s in SIZES]
ico_path = RESOURCES / "icon.ico"
images[0].save(ico_path, format="ICO", sizes=[(s, s) for s in SIZES])

png_path = RESOURCES / "icon.png"
images[0].save(png_path, format="PNG")

# Tray-friendly small PNG
small = make_icon(32)
small.save(RENDERER_ASSETS / "icon.png", format="PNG")

print(f"Wrote {ico_path}")
print(f"Wrote {png_path}")

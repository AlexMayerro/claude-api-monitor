"""Generate icon.png and icon.ico for Memora Lumina.

Renders a rounded square with a Lumina-blue gradient and a soft white "M"
monogram with a subtle inner glow. Output:
  assets/icon.png  (256x256, used by Electron window + builder)
  assets/icon.ico  (Windows multi-size icon for the installer)
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

SIZES = [256, 128, 64, 48, 32, 16]
ACCENT_DARK = (37, 99, 235, 255)    # #2563EB
ACCENT_LIGHT = (96, 165, 250, 255)  # #60A5FA
BG_DARK = (15, 17, 23, 255)         # #0F1117


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def make_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        color = lerp(ACCENT_LIGHT, ACCENT_DARK, t)
        draw.line([(0, y), (size, y)], fill=color)

    radius = max(2, int(size * 0.22))
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)

    if size >= 24:
        font_size = max(10, int(size * 0.6))
        font = None
        for candidate in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "C:\\Windows\\Fonts\\arialbd.ttf",
        ]:
            if os.path.exists(candidate):
                try:
                    font = ImageFont.truetype(candidate, font_size)
                    break
                except Exception:
                    pass
        if font is None:
            font = ImageFont.load_default()
        text = "M"
        # Glow layer
        glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        bbox = gd.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = (size - tw) / 2 - bbox[0]
        ty = (size - th) / 2 - bbox[1] - size * 0.02
        gd.text((tx, ty), text, fill=(255, 255, 255, 180), font=font)
        glow = glow.filter(ImageFilter.GaussianBlur(radius=max(2, size // 32)))
        out = Image.alpha_composite(out, glow)

        d = ImageDraw.Draw(out)
        d.text((tx, ty), text, fill=(255, 255, 255, 255), font=font)
    return out


images = [make_icon(s) for s in SIZES]
ico_path = ASSETS / "icon.ico"
images[0].save(ico_path, format="ICO", sizes=[(s, s) for s in SIZES])

png_path = ASSETS / "icon.png"
images[0].save(png_path, format="PNG")

print(f"Wrote {ico_path}")
print(f"Wrote {png_path}")

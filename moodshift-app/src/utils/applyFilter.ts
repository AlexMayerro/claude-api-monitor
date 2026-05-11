import type { StylePreset } from '../types';
import { loadImage } from './imageHelpers';

/**
 * Build a CSS `filter` string blended at `intensity` (0..1). Each filter
 * primitive is linearly interpolated towards its identity (e.g. saturate(1)).
 */
export function blendedFilter(preset: StylePreset, intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity));
  if (t >= 0.999) return preset.filter;
  const tokens = parseFilter(preset.filter);
  return tokens
    .map((tok) => `${tok.name}(${interpolate(tok.name, tok.value, t)}${tok.unit})`)
    .join(' ');
}

interface FilterToken {
  name: string;
  value: number;
  unit: string;
}

function parseFilter(filter: string): FilterToken[] {
  const re = /(\w+)\(([-\d.]+)([a-z%]*)\)/g;
  const out: FilterToken[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(filter)) !== null) {
    out.push({ name: m[1], value: parseFloat(m[2]), unit: m[3] });
  }
  return out;
}

function identityFor(name: string): number {
  switch (name) {
    case 'brightness':
    case 'contrast':
    case 'saturate':
      return 1;
    case 'grayscale':
    case 'sepia':
    case 'blur':
    case 'invert':
    case 'opacity':
      return 0;
    case 'hue-rotate':
      return 0;
    default:
      return 0;
  }
}

function interpolate(name: string, target: number, t: number): number {
  const id = identityFor(name);
  const v = id + (target - id) * t;
  // Keep two decimal precision for clean CSS.
  return Math.round(v * 100) / 100;
}

/**
 * Render the source image with the given preset to a fresh canvas at the
 * source's natural size. Uses ctx.filter for the look and an optional overlay
 * for additional mood. Returns a data URL (PNG).
 */
export async function renderStyledImage(
  src: string,
  preset: StylePreset,
  intensity = 1,
  maxEdge = 2400,
): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Draw the original first (used as the intensity blend base).
  ctx.filter = 'none';
  ctx.drawImage(img, 0, 0, w, h);

  // Draw the styled version on top at the given intensity.
  const filter = blendedFilter(preset, intensity);
  ctx.globalAlpha = 1;
  ctx.filter = filter;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = 'none';

  if (preset.overlay) {
    const { color, opacity, blend } = preset.overlay;
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = blend;
    ctx.globalAlpha = opacity * intensity;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
  }

  return canvas.toDataURL('image/jpeg', 0.94);
}

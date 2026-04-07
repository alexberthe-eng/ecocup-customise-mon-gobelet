import { MaskType } from '@/store/useStore';

/** Returns a CSS clipPath string for the given mask type */
export function getClipPath(maskType: MaskType): string | undefined {
  switch (maskType) {
    case 'rectangle':
    case null:
      return undefined; // no clip
    case 'circle':
      return 'ellipse(50% 50% at 50% 50%)';
    case 'polaroid':
      return 'polygon(0% 0%, 100% 0%, 100% 80%, 0% 80%)';
    case 'star':
      return 'polygon(50% 5%, 61% 35%, 95% 38%, 70% 58%, 78% 92%, 50% 75%, 22% 92%, 30% 58%, 5% 38%, 39% 35%)';
    case 'badge':
      return 'polygon(50% 5%, 63% 20%, 82% 10%, 78% 32%, 95% 42%, 80% 55%, 88% 75%, 68% 72%, 55% 92%, 45% 72%, 25% 80%, 30% 60%, 10% 48%, 28% 38%, 20% 18%, 40% 25%)';
    case 'drop':
      return 'path("M 0.5 0.05 C 0.5 0.05 0.85 0.55 0.85 0.7 A 0.35 0.35 0 1 1 0.15 0.7 C 0.15 0.55 0.5 0.05 0.5 0.05")';
    default:
      return undefined;
  }
}

/** Applies clip path to a canvas 2D context for offscreen rendering */
export function applyClipToCtx(
  ctx: CanvasRenderingContext2D,
  maskType: MaskType,
  w: number,
  h: number
) {
  if (!maskType || maskType === 'rectangle') return;

  ctx.beginPath();
  switch (maskType) {
    case 'circle':
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case 'polaroid':
      ctx.rect(0, 0, w, h * 0.8);
      break;
    case 'star': {
      const pts = [
        [0.50, 0.05], [0.61, 0.35], [0.95, 0.38], [0.70, 0.58], [0.78, 0.92],
        [0.50, 0.75], [0.22, 0.92], [0.30, 0.58], [0.05, 0.38], [0.39, 0.35],
      ];
      ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * w, pts[i][1] * h);
      ctx.closePath();
      break;
    }
    case 'badge': {
      const pts = [
        [0.50, 0.05], [0.63, 0.20], [0.82, 0.10], [0.78, 0.32], [0.95, 0.42],
        [0.80, 0.55], [0.88, 0.75], [0.68, 0.72], [0.55, 0.92], [0.45, 0.72],
        [0.25, 0.80], [0.30, 0.60], [0.10, 0.48], [0.28, 0.38], [0.20, 0.18], [0.40, 0.25],
      ];
      ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * w, pts[i][1] * h);
      ctx.closePath();
      break;
    }
    case 'drop': {
      ctx.moveTo(0.5 * w, 0.05 * h);
      ctx.bezierCurveTo(0.5 * w, 0.05 * h, 0.85 * w, 0.55 * h, 0.85 * w, 0.7 * h);
      ctx.arc(0.5 * w, 0.7 * h, 0.35 * w, 0, Math.PI * 2);
      ctx.closePath();
      break;
    }
  }
  ctx.clip();
}

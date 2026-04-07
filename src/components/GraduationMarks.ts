/** Graduation mark definitions for different cup sizes */

export interface GradMark {
  label: string;
  /** Position as fraction from bottom (0) to top (1) of the canvas/cup */
  positionY: number;
}

const GRADUATIONS: Record<string, GradMark[]> = {
  'standard-33cl': [
    { label: '25 cl', positionY: 0.22 },
    { label: '12,5 cl', positionY: 0.52 },
    { label: '5 cl', positionY: 0.72 },
  ],
  'standard-25cl': [
    { label: '20 cl', positionY: 0.22 },
    { label: '12,5 cl', positionY: 0.48 },
    { label: '5 cl', positionY: 0.68 },
  ],
  'pinte-50cl': [
    { label: '50 cl', positionY: 0.12 },
    { label: '25 cl', positionY: 0.42 },
    { label: '12,5 cl', positionY: 0.62 },
    { label: '5 cl', positionY: 0.78 },
  ],
};

export function getGraduationMarks(graduation: string): GradMark[] {
  return GRADUATIONS[graduation] ?? GRADUATIONS['standard-33cl'];
}

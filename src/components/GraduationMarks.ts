/** Graduation mark definitions for different cup sizes */

export interface GradMark {
  id: string;
  label: string;
  /** Default position as fraction from top (0) to bottom (1) of the canvas */
  defaultY: number;
  /** Default X as fraction (0-1), 0.5 = center */
  defaultX: number;
}

const GRADUATIONS: Record<string, GradMark[]> = {
  'standard-33cl': [
    { id: 'g-25cl', label: '25 cl', defaultY: 0.45, defaultX: 0.5 },
    { id: 'g-12.5cl', label: '12,5 cl', defaultY: 0.65, defaultX: 0.5 },
    { id: 'g-5cl', label: '5 cl', defaultY: 0.82, defaultX: 0.5 },
  ],
  'standard-25cl': [
    { id: 'g-20cl', label: '20 cl', defaultY: 0.45, defaultX: 0.5 },
    { id: 'g-12.5cl', label: '12,5 cl', defaultY: 0.63, defaultX: 0.5 },
    { id: 'g-5cl', label: '5 cl', defaultY: 0.80, defaultX: 0.5 },
  ],
  'pinte-50cl': [
    { id: 'g-50cl', label: '50 cl', defaultY: 0.38, defaultX: 0.5 },
    { id: 'g-25cl', label: '25 cl', defaultY: 0.56, defaultX: 0.5 },
    { id: 'g-12.5cl', label: '12,5 cl', defaultY: 0.72, defaultX: 0.5 },
    { id: 'g-5cl', label: '5 cl', defaultY: 0.84, defaultX: 0.5 },
  ],
};

export function getGraduationMarks(graduation: string): GradMark[] {
  return GRADUATIONS[graduation] ?? GRADUATIONS['standard-33cl'];
}

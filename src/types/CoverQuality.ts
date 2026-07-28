export const CoverQuality = {
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type CoverQuality = (typeof CoverQuality)[keyof typeof CoverQuality];

export const SKILL_LEVELS = ['curious', 'beginner', 'intermediate'] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

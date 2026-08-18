export interface Hobby {
  id: string;
  name: string;
  category: HobbyCategory;
  icon: string;
  color: string;
  description: string;
}

export type HobbyCategory =
  | 'music'
  | 'sports'
  | 'games'
  | 'art'
  | 'cooking'
  | 'fitness'
  | 'tech'
  | 'crafts'
  | 'outdoor';

export type SkillLevel = 'curious' | 'beginner' | 'intermediate';

export const SKILL_LEVEL_LABELS: Record<SkillLevel, { title: string; description: string }> = {
  curious: {
    title: 'Just Curious',
    description: 'I want to understand the basics and see if I enjoy it',
  },
  beginner: {
    title: 'Getting Started',
    description: 'I want to build a solid foundation and practice regularly',
  },
  intermediate: {
    title: 'Want to Get Good',
    description: 'I have some basics down and want to level up my skills',
  },
};

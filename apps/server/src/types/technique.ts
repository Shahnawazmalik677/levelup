export type TechniqueStatus = 'locked' | 'active' | 'completed' | 'skipped';

export interface Technique {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  order: number;
  status: TechniqueStatus;
  progress: number;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  practiceChecklist: PracticeItem[];
  resources: Resource[];
}

export interface PracticeItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Resource {
  id: string;
  type: 'video' | 'article' | 'interactive';
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  source: string;
}

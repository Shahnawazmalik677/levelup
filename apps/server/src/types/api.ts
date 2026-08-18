import { SkillLevel } from './hobby';
import { Technique } from './technique';

export interface GeneratePlanRequest {
  hobby: string;
  level: SkillLevel;
  preferences?: string;
}

export interface GeneratePlanResponse {
  id: string;
  hobby: string;
  level: SkillLevel;
  techniques: Technique[];
  createdAt: string;
}

export interface SearchVideosRequest {
  query: string;
  maxResults?: number;
}

export interface VideoResult {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  duration: string;
  url: string;
}

export interface SearchVideosResponse {
  videos: VideoResult[];
}

export interface SwapTechniqueRequest {
  hobby: string;
  level: SkillLevel;
  currentTechnique: string;
  existingTechniques: string[];
  reason?: string;
}

export interface SwapTechniqueResponse {
  technique: Technique;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

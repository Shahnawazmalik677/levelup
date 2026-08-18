import Constants from 'expo-constants';
import {
  GeneratePlanRequest,
  GeneratePlanResponse,
  SearchVideosResponse,
  SwapTechniqueRequest,
  SwapTechniqueResponse,
  ApiResponse,
} from '../types';

// On a physical device or emulator, `localhost` refers to the device itself,
// not the machine running the API server. Derive the dev machine's LAN IP
// from the same host Metro is already serving the bundle from.
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:3001/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || 'An unexpected error occurred');
    }

    return data.data;
  }

  async generateLearningPlan(
    params: GeneratePlanRequest
  ): Promise<GeneratePlanResponse> {
    return this.request<GeneratePlanResponse>('/learning-plan', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async searchVideos(query: string, maxResults = 5): Promise<SearchVideosResponse> {
    const params = new URLSearchParams({
      query,
      maxResults: maxResults.toString(),
    });
    return this.request<SearchVideosResponse>(`/videos?${params}`);
  }

  async swapTechnique(
    params: SwapTechniqueRequest
  ): Promise<SwapTechniqueResponse> {
    return this.request<SwapTechniqueResponse>('/swap-technique', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);

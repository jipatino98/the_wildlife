import { WildlifeSpecies } from '../types/Wildlife';

interface ChatContext {
  availableSpecies?: WildlifeSpecies[];
  currentMonth?: number;
}

interface ChatResponse {
  response: string;
  success: boolean;
  fallback?: boolean;
  error?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export class OpenAIService {
  private static instance: OpenAIService;

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async sendChatMessage(message: string, context?: ChatContext): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OpenAI service error:', error);
      return {
        response: '',
        success: false,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async checkHealth(): Promise<{ status: string; openaiConfigured: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        openaiConfigured: false,
      };
    }
  }
}

export const openaiService = OpenAIService.getInstance();
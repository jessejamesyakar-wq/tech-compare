import { CONFIG } from './config';

export class AntigravityClient {
  public static isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0);
  }

  public static getAnalysisAgent(): string {
    return CONFIG.ANALYSIS_AGENT;
  }
}

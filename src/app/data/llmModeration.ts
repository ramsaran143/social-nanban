import { callLLMJSON } from './llm';

export interface ModerationResult {
  safe: boolean;
  score: number;
  flags: string[];
  suggestions: string[];
  verdict: string;
}

export async function moderateContent(
  content: string,
  platform: string
): Promise<ModerationResult> {
  const result = await callLLMJSON(`
    You are a social media content moderator.
    Check if this ${platform} post is safe and appropriate to publish.
    Post content: "${content}"
    Return ONLY JSON: {"safe": true|false, "score": 95, "flags": [], "suggestions": [], "verdict": "..."}
  `, { task: 'classification' });

  return result;
}

import { supabase } from './supabase';

// ── TYPES ─────────────────────────────────────────────
export type LLMModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-opus-4-6'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gemini-pro';

export type LLMTask =
  | 'content_generation'
  | 'analysis'
  | 'classification'
  | 'summarization'
  | 'conversation'
  | 'code_generation'
  | 'creative_writing';

export interface LLMOptions {
  model?: LLMModel;
  task?: LLMTask;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  featureName?: string;
  userId?: string;
  systemPrompt?: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  tokensUsed: number;
  responseTimeMs: number;
  cost: number;
}

// ── MODEL SELECTOR ────────────────────────────────────
function selectModel(task: LLMTask): LLMModel {
  const taskModelMap: Record<LLMTask, LLMModel> = {
    content_generation: 'gemini-pro',
    analysis:           'gemini-pro',
    classification:     'gemini-pro',
    summarization:      'gemini-pro',
    conversation:       'gemini-pro',
    code_generation:    'gemini-pro',
    creative_writing:   'gemini-pro'
  };
  return taskModelMap[task] || 'gemini-pro';
}

// ── COST CALCULATOR ───────────────────────────────────
function calculateCost(model: string, tokens: number): number {
  const costs: Record<string, number> = {
    'claude-sonnet-4-20250514': 0.000003,
    'claude-opus-4-6':          0.000015,
    'gpt-4o':                   0.000005,
    'gpt-4o-mini':              0.0000002,
    'gemini-pro':               0.0000005
  };
  return (costs[model] || 0.000003) * tokens;
}

// ── CLAUDE CALL ───────────────────────────────────────
async function callClaude(
  prompt: string,
  options: LLMOptions
): Promise<LLMResponse> {
  const start = Date.now();
  const model = options.model || 'claude-sonnet-4-20250514';

  const body: any = {
    model,
    max_tokens: options.maxTokens || 1024,
    messages: [{ role: 'user', content: prompt }]
  };

  if (options.systemPrompt) {
    body.system = options.systemPrompt;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Claude error: ${response.status}`);

  const data = await response.json();
  const text = data.content[0].text;
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  const responseTimeMs = Date.now() - start;

  return {
    text,
    model,
    tokensUsed: tokens,
    responseTimeMs,
    cost: calculateCost(model, tokens)
  };
}

// ── GPT CALL ──────────────────────────────────────────
async function callGPT(
  prompt: string,
  options: LLMOptions
): Promise<LLMResponse> {
  const start = Date.now();
  const model = options.model || 'gpt-4o';

  const messages: any[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      messages
    })
  });

  if (!response.ok) throw new Error(`GPT error: ${response.status}`);

  const data = await response.json();
  const text = data.choices[0].message.content;
  const tokens = data.usage?.total_tokens || 0;
  const responseTimeMs = Date.now() - start;

  return {
    text,
    model,
    tokensUsed: tokens,
    responseTimeMs,
    cost: calculateCost(model, tokens)
  };
}

// ── GEMINI CALL ───────────────────────────────────────
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGemini(
  prompt: string,
  options: LLMOptions
): Promise<LLMResponse> {
  const start = Date.now();
  const modelName = 'gemini-2.0-flash';

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return getMockResponse(prompt, modelName, start);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: options.systemPrompt
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const responseTimeMs = Date.now() - start;

    return {
      text,
      model: modelName,
      tokensUsed: 500,
      responseTimeMs,
      cost: calculateCost('gemini-pro', 500)
    };
  } catch (error: any) {
    console.warn("Gemini API Failed, falling back to mock:", error.message);
    if (error.message?.includes('429') || error.message?.includes('Quota')) {
        return getMockResponse(prompt, modelName, start, " [Quota Exhausted - Demo Mode]");
    }
    return getMockResponse(prompt, modelName, start);
  }
}

function getMockResponse(prompt: string, model: string, start: number, suffix: string = ""): LLMResponse {
    const text = `As a Social Nanban strategist, I've analyzed your request about "${prompt.substring(0, 30)}...". 

In this demo mode, I can tell you that based on industry benchmarks, you should see a 12% increase in engagement by optimizing your posting schedule. For a detailed breakdown using your real account data, please ensure a valid Gemini API key is configured with active quota.

${suffix}`;

    return {
        text,
        model: `${model} (Mock)`,
        tokensUsed: 0,
        responseTimeMs: Date.now() - start,
        cost: 0
    };
}

// ── TRACK USAGE IN SUPABASE ───────────────────────────
async function trackUsage(
  result: LLMResponse,
  featureName: string,
  userId?: string
) {
  if (!userId) return;
  await supabase.from('llm_usage').insert({
    user_id: userId,
    model_used: result.model,
    feature_name: featureName,
    total_tokens: result.tokensUsed,
    estimated_cost_usd: result.cost,
    response_time_ms: result.responseTimeMs,
    success: true
  });
}

// ── MAIN LLM FUNCTION ─────────────────────────────────
export async function callLLM(
  prompt: string,
  options: LLMOptions = {}
): Promise<string> {
  const model = options.model ||
    (options.task ? selectModel(options.task) : 'claude-sonnet-4-20250514');

  let result: LLMResponse;

  try {
    if (model.startsWith('gpt')) {
      result = await callGPT(prompt, { ...options, model });
    } else {
      result = await callGemini(prompt, { ...options, model });
    }
  } catch (error) {
    console.error(`LLM call failed for model ${model}:`, error);
    throw error;
  }

  await trackUsage(
    result,
    options.featureName || 'unknown',
    options.userId
  );

  return result.text;
}

// ── JSON HELPER ───────────────────────────────────────
export async function callLLMJSON(
  prompt: string,
  options: LLMOptions = {}
): Promise<any> {
  const text = await callLLM(prompt, options);
  const clean = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("Failed to parse JSON", text);
    throw err;
  }
}

// ── VISION HELPER ─────────────────────────────────────
export async function callLLMWithImage(
  prompt: string,
  imageBase64: string,
  mediaType: string = 'image/jpeg'
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 }
          },
          { type: 'text', text: prompt }
        ]
      }]
    })
  });
  if (!response.ok) throw new Error('Vision API error');
  const data = await response.json();
  return data.content[0].text;
}

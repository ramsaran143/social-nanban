import { createPost, getMetrics, getPosts } from './api';
import { callLLMJSON, callLLM } from './llm';

const AVAILABLE_FUNCTIONS = {
  create_post: {
    description: 'Create and schedule a social media post',
    parameters: {
      platform: 'string — instagram, twitter, or linkedin',
      content: 'string — the post text content',
      hashtags: 'string — space separated hashtags',
      scheduled_at: 'string — ISO date string when to post',
      status: 'string — draft, scheduled, or published'
    },
    handler: async (params: any) => {
      const post = await createPost(params);
      return { success: true, message: 'Post created!', post };
    }
  },
  get_metrics_summary: {
    description: 'Get current metrics and performance data',
    parameters: { platform: 'string — optional platform filter' },
    handler: async (params: any) => {
      const metrics = await getMetrics(params.platform);
      return { success: true, metrics };
    }
  },
  get_recent_posts: {
    description: 'Get list of recent posts',
    parameters: {
      platform: 'string — optional platform filter',
      status: 'string — optional status filter',
      limit: 'number — how many posts to return'
    },
    handler: async (params: any) => {
      const posts = await getPosts(params.platform);
      return { success: true, posts: posts.slice(0, params.limit || 10) };
    }
  },
  analyze_best_posting_time: {
    description: 'Analyze when is the best time to post',
    parameters: { platform: 'string — which platform to analyze' },
    handler: async (params: any) => {
      const posts = await getPosts(params.platform);
      const byHour: Record<number, number[]> = {};
      posts.forEach((p: any) => {
        if (p.scheduled_at) {
          const hour = new Date(p.scheduled_at).getHours();
          if (!byHour[hour]) byHour[hour] = [];
          byHour[hour].push(p.likes || 0);
        }
      });
      const bestHours = Object.entries(byHour)
        .map(([hour, likes]) => ({
          hour: parseInt(hour),
          avgLikes: likes.reduce((s, l) => s + l, 0) / likes.length
        }))
        .sort((a, b) => b.avgLikes - a.avgLikes)
        .slice(0, 3);
      return { success: true, bestHours, platform: params.platform };
    }
  }
};

export async function callLLMWithFunctions(
  userMessage: string,
  context: string,
  userId: string
): Promise<{ reply: string, actionTaken?: string }> {

  const decision = await callLLMJSON(`
    User message: "${userMessage}"
    Context: ${context}
    Available functions: ${JSON.stringify(AVAILABLE_FUNCTIONS)}
    Decide if an action should be taken. Break down parameters.
    Return ONLY JSON: {"should_act": true|false, "function_name": "...", "function_params": {...}}
  `, { task: 'classification', userId });

  if (decision.should_act && decision.function_name) {
    const fn = (AVAILABLE_FUNCTIONS as any)[decision.function_name];
    if (fn) {
      const result = await fn.handler(decision.function_params);
      const reply = await callLLM(`
        Action taken: ${decision.function_name}. Result: ${JSON.stringify(result)}. 
        Tell the user friendly sentences about it.
      `, { task: 'conversation', userId });
      return { reply, actionTaken: decision.function_name };
    }
  }

  const reply = await callLLM(`${context}\nUser: "${userMessage}"`, { task: 'conversation', userId });
  return { reply };
}

import { supabase } from './supabase';
import { callLLM } from './llm';
import { v4 as uuidv4 } from 'uuid';
import { loadMemories, extractAndSaveMemories, formatMemoriesForContext } from './llmMemory';
import { searchKnowledge } from './ragKnowledgeSeeder';

export async function retrieveUserData(userId: string) {
  try {
    const [metricsRes, postsRes, profileRes, aiResultsRes, conversationsRes] = await Promise.all([
      supabase.from('metrics').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(100),
      supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('ai_results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('rag_conversations').select('question, answer, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
    ]);

    return {
      metrics: metricsRes?.data || [],
      posts: postsRes?.data || [],
      profile: profileRes?.data || {},
      aiResults: aiResultsRes?.data || [],
      recentChats: conversationsRes?.data || []
    };
  } catch (err) {
    console.warn("Supabase user data fetch failed, using empty context.", err);
    return {
      metrics: [],
      posts: [],
      profile: {},
      aiResults: [],
      recentChats: []
    };
  }
}


export function buildContextString(data: any, question: string): string {
  const { metrics, posts, profile, aiResults, recentChats } = data;
  const totalFollowers = metrics.reduce((sum: number, m: any) => sum + (m.followers || 0), 0);
  const totalLikes = metrics.reduce((sum: number, m: any) => sum + (m.likes || 0), 0);
  const totalReach = metrics.reduce((sum: number, m: any) => sum + (m.reach || 0), 0);
  const avgEngagement = metrics.length > 0 ? (metrics.reduce((sum: number, m: any) => sum + (m.engagement_rate || 0), 0) / metrics.length).toFixed(2) : '0';
  const platformCounts = posts.reduce((acc: any, p: any) => { acc[p.platform] = (acc[p.platform] || 0) + 1; return acc; }, {});
  const persona = aiResults.find((r: any) => r.feature_type === 'audience_persona');
  const strategy = aiResults.find((r: any) => r.feature_type === 'weekly_strategy');
  const historyBlock = recentChats.length > 0 ? recentChats.reverse().map((c: any) => `Q: ${c.question}\nA: ${c.answer}`).join('\n\n') : 'No previous conversations';

  return `
--- PROFILE ---
Name: ${profile.full_name || 'Not set'}
Followers: ${totalFollowers.toLocaleString()} | Likes: ${totalLikes.toLocaleString()} | Reach: ${totalReach.toLocaleString()}
Engagement: ${avgEngagement}% | Posts: ${posts.length}

--- PLATFORMS ---
${Object.entries(platformCounts).map(([p, c]) => `${p}: ${c} posts`).join(', ')}

--- TOP POSTS ---
${posts.slice(0, 5).map((p: any) => `- [${p.platform}] ${p.content?.substring(0,60)}... (${p.likes} likes)`).join('\n')}

${persona ? `--- AUDIENCE ---\n${JSON.stringify(persona.result_json)}` : ''}
${historyBlock ? `--- HISTORY ---\n${historyBlock}` : ''}
USER QUESTION: ${question}
`.trim();
}

export async function buildContextStringWithMemory(data: any, question: string, userId: string): Promise<string> {
  const memories = await loadMemories(userId);
  const memoryBlock = formatMemoriesForContext(memories);
  const baseContext = buildContextString(data, question);
  return memoryBlock + '\n\n' + baseContext;
}

export async function generateRAGAnswer(question: string, userId: string, sessionId: string): Promise<{ answer: string, contextSummary: any }> {
  const platforms = ['instagram', 'linkedin', 'twitter', 'tiktok', 'youtube'];
  const detectedPlatform = platforms.find(p => question.toLowerCase().includes(p)) || 'all';

  const data = await retrieveUserData(userId);
  const userContext = await buildContextStringWithMemory(data, question, userId);
  const knowledgeContext = await searchKnowledge(question, detectedPlatform);

  const systemPrompt = `
You are a strategic AI for "Social Nanban". 

=== EXPERT 2026 KNOWLEDGE ===
${knowledgeContext || 'No specific benchmarks found.'}

=== USER ACCOUNT DATA ===
${userContext}

Reference real numbers and compare user's metrics against the 2026 platform benchmarks provided above.
Be direct, actionable, and state sources if relevant.
  `;

  const answer = await callLLM(systemPrompt, { task: 'conversation', userId });

  await extractAndSaveMemories(userId, question, answer);

  await supabase.from('rag_conversations').insert({
    user_id: userId, session_id: sessionId, question, answer,
    context_used: { metrics_count: data.metrics.length, posts_count: data.posts.length }
  });

  return { answer, contextSummary: { metricsLoaded: data.metrics.length, postsLoaded: data.posts.length } };
}

export async function loadConversationHistory(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase.from('rag_conversations').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Failed to load chat history. Using empty history.", err);
    return [];
  }
}

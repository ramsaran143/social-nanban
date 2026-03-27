
import { supabase } from './supabase';

/**
 * Saves AI-generated results to the Supabase database.
 */
export async function saveAIResult(payload: {
  feature_type: string;
  input_data?: object;
  result_text?: string;
  result_json?: object;
  platform?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('ai_results')
    .insert({ ...payload, user_id: user.id })
    .select();

  if (error) {
    console.error("Supabase Save Error:", error);
    throw error;
  }
  return data;
}

/**
 * Fetches the most recent AI result based on feature_type and optional platform.
 */
export async function getAIResult(feature_type: string, platform?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from('ai_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('feature_type', feature_type)
    .order('created_at', { ascending: false })
    .limit(1);

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Supabase Fetch Error:", error);
    throw error;
  }
  return data?.[0] || null;
}

/**
 * Saves a custom piece of knowledge to the user's base for RAG (Retrieval-Augmented Generation).
 */
export async function saveKnowledge(content: string, category: string = 'general') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const { data, error } = await supabase
    .from('knowledge_base')
    .insert({ user_id: user.id, content, category })
    .select();

  if (error) throw error;
  return data;
}

/**
 * Fetches relevant knowledge for RAG context.
 */
export async function getKnowledgeBase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10); // Last 10 bits of info as context

  if (error) throw error;
  return data || [];
}

/**
 * Creates a new social media post in Supabase.
 */
export async function createPost(payload: {
  platform: string;
  content: string;
  hashtags?: string;
  scheduled_at?: string;
  status?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user authenticated");
  const { data, error } = await supabase.from('posts').insert({
    ...payload,
    user_id: user.id
  }).select().single();
  if (error) throw error;
  return data;
}

/**
 * Fetches metrics for a user.
 */
export async function getMetrics(platform?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase.from('metrics').select('*').eq('user_id', user.id);
  if (platform) query = query.eq('platform', platform);
  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Fetches posts for a user.
 */
export async function getPosts(platform?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase.from('posts').select('*').eq('user_id', user.id);
  if (platform) query = query.eq('platform', platform);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

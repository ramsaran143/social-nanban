import { supabase } from './supabase';

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000)
    })
  });
  if (!response.ok) throw new Error('Embedding error');
  const data = await response.json();
  return data.data[0].embedding;
}

export async function embedPost(userId: string, postId: number, content: string) {
  const embedding = await generateEmbedding(content);
  const { error } = await supabase.from('llm_embeddings').upsert({
    user_id: userId, content_type: 'post', content_id: postId, content_text: content, embedding
  }, { onConflict: 'user_id, content_type, content_id' });
  if (error) throw error;
}

export async function semanticSearchPosts(userId: string, searchQuery: string, limit: number = 5): Promise<any[]> {
  const queryEmbedding = await generateEmbedding(searchQuery);

  const { data, error } = await supabase.rpc('match_posts', {
    query_embedding: queryEmbedding,
    user_id_filter: userId,
    match_count: limit
  });

  if (error) {
    const { data: posts } = await supabase.from('posts').select('*').eq('user_id', userId).ilike('content', `%${searchQuery}%`).limit(limit);
    return posts || [];
  }
  return data || [];
}

export async function embedAllPosts(userId: string) {
  const { data: posts } = await supabase.from('posts').select('id, content').eq('user_id', userId).not('content', 'is', null);
  if (!posts) return;
  for (const post of posts) {
    try { await embedPost(userId, post.id, post.content); } catch { /* skip silenty */ }
  }
}

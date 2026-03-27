import { supabase } from './supabase';

export type MemoryType =
  | 'user_preference'
  | 'platform_insight'
  | 'content_pattern'
  | 'audience_fact'
  | 'performance_fact'
  | 'goal';

export interface Memory {
  key: string;
  value: string;
  type: MemoryType;
  importance: number;
}

export async function saveMemory(userId: string, memory: Memory) {
  if (userId === 'demo-user-id') return;
  try {
    const { error } = await supabase
      .from('llm_memory')
      .upsert({
        user_id: userId,
        memory_type: memory.type,
        memory_key: memory.key,
        memory_value: memory.value,
        importance: memory.importance,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, memory_key'
      });
    if (error) throw error;
  } catch (err) {
    console.warn("Failed to save memory.", err);
  }
}

export async function loadMemories(userId: string, type?: MemoryType): Promise<Memory[]> {
  try {
    let query = supabase
      .from('llm_memory')
      .select('*')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .limit(50);

    if (type) query = query.eq('memory_type', type);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(row => ({
      key: row.memory_key,
      value: row.memory_value,
      type: row.memory_type as MemoryType,
      importance: row.importance
    }));
  } catch (err) {
    console.warn("Failed to load memoires, ignoring for demo.", err);
    return [];
  }
}

export async function deleteMemory(userId: string, key: string) {
  const { error } = await supabase
    .from('llm_memory')
    .delete()
    .eq('user_id', userId)
    .eq('memory_key', key);
  if (error) throw error;
}

export async function extractAndSaveMemories(userId: string, question: string, answer: string) {
  const { callLLMJSON } = await import('./llm');

  try {
    const memories = await callLLMJSON(`
      Read this conversation and extract any important facts
      worth remembering about this user for future conversations.

      User asked: "${question}"
      AI answered: "${answer}"

      Extract up to 3 important facts.
      Return ONLY this JSON array (empty array if nothing worth saving):
      [
        {
          "key": "unique_memory_key_no_spaces",
          "value": "The fact to remember in plain English",
          "type": "user_preference",
          "importance": 8
        }
      ]
    `, { task: 'classification', userId });

    if (Array.isArray(memories)) {
      for (const memory of memories) {
        await saveMemory(userId, memory);
      }
    }
  } catch {
    // Silent fail for non-critical memory extraction
  }
}

export function formatMemoriesForContext(memories: Memory[]): string {
  if (memories.length === 0) return '';
  return `
=== WHAT I REMEMBER ABOUT YOU ===
${memories.map(m => `- ${m.value}`).join('\n')}
=================================
  `.trim();
}

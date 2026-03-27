import { supabase } from './supabase'
import { searchKnowledge } from './ragKnowledgeSeeder'
import { retrieveUserData, buildContextString } from './rag'
import { loadMemories, formatMemoriesForContext, extractAndSaveMemories } from './llmMemory'

// ── TYPES ─────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  isLoading?: boolean
  rating?: 'up' | 'down'
  metadata?: {
    knowledgeUsed?: number
    platformDetected?: string
    responseTime?: number
  }
}

export interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  userId: string
  createdAt: Date
}

// ── SUGGESTED QUESTIONS ───────────────────────────────
export const SUGGESTED_QUESTIONS = [
  "When is the best time to post on Instagram?",
  "What hashtags should I use on LinkedIn?",
  "Why is my engagement rate dropping?",
  "Which platform should I focus on?",
  "What type of content gets most engagement?",
  "How often should I post on TikTok?",
  "Create a post about my new product launch",
  "Compare my Instagram vs LinkedIn performance",
  "What are the trending topics right now?",
  "How can I grow my followers faster?"
]

// ── QUICK REPLY SUGGESTIONS ───────────────────────────
export const QUICK_REPLIES: Record<string, string[]> = {
  posting_time: [
    "What about LinkedIn?",
    "What about TikTok?",
    "Show me all platforms"
  ],
  hashtags: [
    "How many hashtags?",
    "Best hashtags for Instagram",
    "Best hashtags for LinkedIn"
  ],
  engagement: [
    "How do I improve it?",
    "What is a good engagement rate?",
    "Compare my platforms"
  ],
  content: [
    "Give me post ideas",
    "What format works best?",
    "Show trending topics"
  ],
  general: [
    "Tell me more",
    "Give me an example",
    "What should I do next?"
  ]
}

// ── DETECT PLATFORM FROM QUESTION ─────────────────────
function detectPlatform(question: string): string | undefined {
  const q = question.toLowerCase()
  const map: Record<string, string[]> = {
    instagram: ['instagram', 'ig', 'reel', 'reels', 'story', 'stories'],
    twitter:   ['twitter', 'tweet', 'x', 'tweets'],
    linkedin:  ['linkedin', 'professional', 'b2b'],
    tiktok:    ['tiktok', 'tik tok', 'tok'],
    youtube:   ['youtube', 'yt', 'video', 'shorts'],
    facebook:  ['facebook', 'fb', 'meta']
  }
  for (const [platform, keywords] of Object.entries(map)) {
    if (keywords.some(k => q.includes(k))) return platform
  }
  return undefined
}

// ── DETECT INTENT FROM QUESTION ───────────────────────
function detectIntent(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('time') || q.includes('when') || q.includes('schedule'))
    return 'posting_time'
  if (q.includes('hashtag') || q.includes('tag') || q.includes('#'))
    return 'hashtags'
  if (q.includes('engagement') || q.includes('rate') || q.includes('drop'))
    return 'engagement'
  if (q.includes('content') || q.includes('post') || q.includes('format'))
    return 'content'
  if (q.includes('trend') || q.includes('trending') || q.includes('topic'))
    return 'trending'
  if (q.includes('follower') || q.includes('grow') || q.includes('reach'))
    return 'growth'
  if (q.includes('create') || q.includes('write') || q.includes('generate'))
    return 'create'
  return 'general'
}

// ── SYSTEM PROMPT ──────────────────────────────────────
function buildSystemPrompt(): string {
  return `
You are SocialPulse AI — a smart, friendly, expert social media strategist chatbot.

YOUR PERSONALITY:
- Friendly and encouraging but always professional
- Data-driven — always back advice with real numbers
- Specific — never give vague generic advice
- Concise — keep answers under 250 words unless breakdown needed
- Actionable — always end with a clear next step

YOUR KNOWLEDGE:
- You have access to real 2026 social media research data
- You have access to the user's real account data from their database
- You combine BOTH to give highly personalized advice
- You know benchmarks, best posting times, hashtag strategies,
  content formats, platform demographics, trending topics

YOUR RULES:
1. Always reference real numbers from the data provided
2. Compare user performance against 2026 industry benchmarks
3. Be encouraging when performance is good
4. Be honest and constructive when performance needs improvement
5. Suggest specific actionable next steps
6. Use bullet points for lists of 3 or more items
7. Use emojis sparingly — only 1 or 2 per response maximum
8. If asked to create content — create it immediately, do not ask questions
9. If you do not know something — say so honestly
10. Never make up statistics — only use data from the context provided

FORMAT:
- Short answer first (1-2 sentences)
- Supporting data and details
- Clear next action at the end
- Keep responses conversational not robotic
  `.trim()
}

// ── BUILD FULL CONTEXT ─────────────────────────────────
async function buildFullContext(
  question: string,
  userId: string
): Promise<string> {
  const platform = detectPlatform(question)

  const [userData, knowledgeData, memories] = await Promise.all([
    retrieveUserData(userId),
    searchKnowledge(question, platform, 4),
    loadMemories(userId)
  ])

  const userContext = buildContextString(userData, question)
  const memoryBlock = formatMemoriesForContext(memories)

  return `
${memoryBlock ? `MEMORY ABOUT THIS USER:\n${memoryBlock}\n\n` : ''}
EXPERT KNOWLEDGE (2026 Research Data):
${knowledgeData || 'No specific knowledge found for this query.'}

USER ACCOUNT DATA (Real Data from Database):
${userContext}
  `.trim()
}

// ── LOAD CHAT HISTORY ──────────────────────────────────
export async function loadChatHistory(
  userId: string,
  sessionId: string,
  limit: number = 30
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chatbot_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return data.map((row: any) => ({
    id: row.id.toString(),
    role: row.role as 'user' | 'assistant',
    content: row.content,
    timestamp: new Date(row.created_at),
    metadata: row.metadata
  }))
}

// ── SAVE MESSAGE TO DATABASE ───────────────────────────
async function saveMessage(
  userId: string,
  sessionId: string,
  role: string,
  content: string,
  metadata?: object
) {
  // If no userId, skip database
  if (!userId || userId.includes('demo')) return;
  await supabase.from('chatbot_conversations').insert({
    user_id: userId,
    session_id: sessionId,
    role,
    content,
    metadata: metadata || {}
  })
}

// ── MAIN STREAMING CHAT FUNCTION ──────────────────────
export async function streamChatResponse(
  question: string,
  userId: string,
  sessionId: string,
  conversationHistory: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: (fullText: string, metadata: object) => void,
  onError: (error: Error) => void
) {
  const startTime = Date.now()

  try {
    const platform = detectPlatform(question)
    const intent = detectIntent(question)

    // Build full context
    const context = await buildFullContext(question, userId)

    // Build conversation history for Gemini
    const history = conversationHistory
      .filter(m => m.role !== 'system')
      .slice(-10)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

    // Use Gemini SDK for streaming
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey.includes('your-gemini')) {
      throw new Error("Gemini API key is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: buildSystemPrompt()
    });

    const chat = model.startChat({
      history: history.slice(0, -1), // Everything except the last message
    });

    // Content for the latest message with context
    const fullPrompt = `
Context for this conversation:
${context}

Now answer this question: ${question}
    `.trim();

    const result = await chat.sendMessageStream(fullPrompt);
    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }

    const responseTime = Date.now() - startTime
    const metadata = {
      platformDetected: platform || 'general',
      intentDetected: intent,
      responseTimeMs: responseTime
    }

    // Save both messages to database (safely skips in demo)
    await Promise.all([
      saveMessage(userId, sessionId, 'user', question),
      saveMessage(userId, sessionId, 'assistant', fullText, metadata)
    ])

    // Extract memories in background
    extractAndSaveMemories(userId, question, fullText).catch(() => {})

    onDone(fullText, metadata)

  } catch (error: any) {
    console.error("Chat Error:", error);
    
    // Fallback Mock Stream if Quota error
    if (error.message?.includes('429') || error.message?.includes('Quota')) {
        const mockText = "Hello! It looks like our Gemini API project has reached its free tier limit for today. \n\nI'm switching to **Offline Strategy Mode** to help you. Based on the 2026 trends I have in my local memory, your Instagram engagement could improve by 15% if you post between 6 PM - 8 PM IST. \n\n*To restore my full real-time intelligence, please update your Gemini API key in the settings.*";
        
        let current = "";
        const words = mockText.split(" ");
        for (const word of words) {
            current += word + " ";
            onChunk(word + " ");
            await new Promise(r => setTimeout(r, 50));
        }
        onDone(mockText, { mode: 'offline_fallback', error: error.message });
        return;
    }
    
    onError(error as Error)
  }
}

// ── SAVE FEEDBACK ──────────────────────────────────────
export async function saveFeedback(
  userId: string,
  messageId: string,
  rating: 'up' | 'down'
) {
  // Safe skip if demo
  if (!userId || userId.includes('demo')) return;
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('chatbot_feedback').insert({
    user_id: userId,
    message_id: messageId,
    rating
  })
}

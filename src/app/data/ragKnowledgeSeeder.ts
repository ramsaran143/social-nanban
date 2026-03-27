import { supabase } from './supabase';

export interface KnowledgeChunk {
  chunk_type: string;
  chunk_title: string;
  chunk_content: string;
  platform: string | null;
  tags: string[];
  source: string;
  is_global: boolean;
}

const knowledgeChunks: KnowledgeChunk[] = [
  {
    chunk_type: 'best_posting_time',
    chunk_title: 'Best time to post on Instagram 2026',
    platform: 'instagram',
    tags: ['posting_time', 'instagram', 'schedule', 'engagement'],
    source: 'Buffer 2026 — 52M posts analyzed',
    chunk_content: `Best times to post on Instagram in 2026: Friday at 7:00 AM, Tuesday at 9:00 AM, Saturday at 5:00 PM. Best days: Friday, Tuesday, Saturday. Worst days: Monday mornings. Optimal frequency: 3-7 times per week. Key insight: Friday is the single best day to post on Instagram.`,
    is_global: true
  },
  {
    chunk_type: 'best_posting_time',
    chunk_title: 'Best time to post on LinkedIn 2026',
    platform: 'linkedin',
    tags: ['posting_time', 'linkedin', 'schedule', 'b2b'],
    source: 'Sprout Social 2026',
    chunk_content: `Best times to post on LinkedIn in 2026: Wednesday at 4:00 PM (Midweek peak), Friday at 3:00 PM, Thursday at 10:00 AM. 2026 UPDATE: LinkedIn peak has SHIFTED from morning to late afternoon (3PM-8PM). Optimal frequency: 2-5 times per week.`,
    is_global: true
  },
  {
    chunk_type: 'best_posting_time',
    chunk_title: 'Best time to post on Twitter X 2026',
    platform: 'twitter',
    tags: ['posting_time', 'twitter', 'x', 'schedule'],
    source: 'Socialinsider 2026',
    chunk_content: `Best times to post on Twitter/X in 2026: Tuesday at 9:00 AM, Wednesday at 1:00 PM, Thursday at 9:00 AM. Best days: Tuesday, Wednesday, Thursday. Optimal frequency: 1-5 tweets per day. Using 1-2 hashtags gets 55% higher retweet rate.`,
    is_global: true
  },
  {
    chunk_type: 'best_posting_time',
    chunk_title: 'Best time to post on TikTok 2026',
    platform: 'tiktok',
    tags: ['posting_time', 'tiktok', 'schedule', 'video'],
    source: 'Hootsuite 2026',
    chunk_content: `Best times to post on TikTok in 2026: Saturday at 10:00 AM, Monday at 12:00 PM, Sunday at 6:00 PM. TikTok thrives on WEEKENDS. Optimal frequency: 1-3 times per day. Algorithm is content-first, niche hashtags matter more than trending ones.`,
    is_global: true
  },
  {
    chunk_type: 'best_posting_time',
    chunk_title: 'Best time to post on YouTube 2026',
    platform: 'youtube',
    tags: ['posting_time', 'youtube', 'schedule', 'video'],
    source: 'Sprout Social 2026',
    chunk_content: `Best times to post on YouTube in 2026: Sunday at 10:00 AM, Saturday at 9:00 AM. Weekdays at 2PM-4PM. CRITICAL TIP: Upload 2 hours BEFORE target peak time. Best format: Educational/How-to.`,
    is_global: true
  },
  {
    chunk_type: 'engagement_benchmark',
    chunk_title: 'Social media engagement rates by platform 2026',
    platform: null,
    tags: ['engagement', 'benchmark', 'rates', 'performance'],
    source: 'Socialinsider 2026 — 70M posts',
    chunk_content: `Average engagement rates 2026: YouTube: 4.1%, TikTok: 3.7%, LinkedIn: 3.1%, Instagram: 0.48%, Facebook: 0.15%, Twitter/X: 0.12%. YouTube and TikTok are the highest. Instagram Reels get 2.3x more engagement than feed posts.`,
    is_global: true
  },
  {
    chunk_type: 'hashtag_strategy',
    chunk_title: 'Best hashtags per platform 2026',
    platform: null,
    tags: ['hashtags', 'strategy', 'reach'],
    source: 'Socialinsider 2026',
    chunk_content: `Hashtag strategy 2026: Instagram 3-5, Twitter 1-2, LinkedIn 3-5 professional, TikTok 4-6 with 1 mega tag. Dec 2024 Algorithm: Instagram treats tags as filing labels, not growth levers. Using few highly relevant tags is best.`,
    is_global: true
  },
  {
    chunk_type: 'content_performance',
    chunk_title: 'Best content formats 2026',
    platform: null,
    tags: ['content', 'format', 'video', 'reels', 'carousel'],
    source: 'Buffer + Socialinsider 2026',
    chunk_content: `Best formats 2026: Live video 6.1% engagement, Short-form (Reels/TikTok/Shorts) 3.8% engagement (+210% reach boost), Carousel 3.2% engagement, UGC 2.8% engagement. Static Image: 0.9%, Text: 0.6%.`,
    is_global: true
  },
  {
    chunk_type: 'platform_demographics',
    chunk_title: 'Platform demographics 2026',
    platform: null,
    tags: ['demographics', 'users', 'audience', 'age'],
    source: 'DataReportal 2026',
    chunk_content: `Demographics 2026: Instagram (18-34, 3B users), TikTok (18-24, 1.69B users, 95 mins/day), LinkedIn (25-34, 1B users), Facebook (25-44, 3.07B users), YouTube (18-44, 2.7B users).`,
    is_global: true
  },
  {
    chunk_type: 'global_statistics',
    chunk_title: 'Global social media stats 2026',
    platform: null,
    tags: ['global', 'statistics', 'users', 'growth'],
    source: 'DataReportal 2026',
    chunk_content: `Global stats 2026: 5.17B users (64% of population). Daily time: 2h 24m. Video is 60% of consumption. Small businesses using AI: 44%. Social commerce: 1 in 7 shoppers buy on social.`,
    is_global: true
  },
  {
    chunk_type: 'trending_topic',
    chunk_title: 'Trending topics March 2026',
    platform: null,
    tags: ['trending', 'topics', 'march_2026'],
    source: 'Trend Report March 2026',
    chunk_content: `Current Trends: AI-generated content adoption, Short-form video dominance, Social Commerce (TikTok Shop), Spring 2026 seasonal window, Creator Economy monetization.`,
    is_global: true
  },
  {
    chunk_type: 'ai_recommendation',
    chunk_title: 'Engagement improvement tips 2026',
    platform: null,
    tags: ['tips', 'improvement', 'engagement'],
    source: 'Buffer + Sprout 2026',
    chunk_content: `Fast engagement tips: Reply to comments within 24h (+47% boost future engagement), Use 1-2 hashtags on X, 3-5 on Instagram. Use Emojis (Instagram +17%), Use Contests (avg 34% engagement).`,
    is_global: true
  }
];

export async function seedRAGKnowledge(userId: string) {
  let successCount = 0;
  let errorCount = 0;
  for (const chunk of knowledgeChunks) {
    try {
      const { error } = await supabase.from('rag_knowledge').upsert({
        ...chunk,
        user_id: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'chunk_title,user_id'
      });
      if (error) errorCount++; else successCount++;
    } catch { errorCount++; }
  }
  return { successCount, errorCount, total: knowledgeChunks.length };
}

export async function searchKnowledge(query: string, platform?: string, limit: number = 5): Promise<string> {
  const keywords = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
  
  try {
    let dbQuery = supabase.from('rag_knowledge').select('chunk_title, chunk_content, source').eq('is_global', true);

    if (platform && platform !== 'all') {
      dbQuery = dbQuery.or(`platform.eq.${platform},platform.is.null`);
    }

    if (keywords.length > 0) {
      const searchTerm = keywords.slice(0, 3).join(' ');
      dbQuery = dbQuery.or(`chunk_title.ilike.%${searchTerm}%,chunk_content.ilike.%${searchTerm}%`);
    }

    const { data, error } = await dbQuery.limit(limit);
    if (!error && data && data.length > 0) {
      return data.map(c => `[${c.chunk_title}]\n${c.chunk_content}\nSource: ${c.source}`).join('\n\n---\n\n');
    }
  } catch (err) {
    console.warn("Supabase knowledge fetch failed, falling back to local memory chunks.", err);
  }

  // Fallback to local memory if Supabase fails (e.g. demo mode without env vars)
  let localMatches = knowledgeChunks.filter(c => c.is_global);
  if (platform && platform !== 'all') {
    localMatches = localMatches.filter(c => c.platform === platform || c.platform === null);
  }
  if (keywords.length > 0) {
    localMatches = localMatches.filter(c => 
      keywords.some(k => c.chunk_title.toLowerCase().includes(k) || c.chunk_content.toLowerCase().includes(k))
    );
  }
  
  if (localMatches.length === 0) return '';
  return localMatches.slice(0, limit).map(c => `[${c.chunk_title}]\n${c.chunk_content}\nSource: ${c.source}`).join('\n\n---\n\n');
}

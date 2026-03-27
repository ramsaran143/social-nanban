import { supabase } from './supabase';

const MOCK_METRICS = [
  { platform: 'instagram', followers: 12450, likes: 842, reach: 45000, engagement_rate: 4.8, updated_at: new Date().toISOString() },
  { platform: 'linkedin', followers: 3200, likes: 450, reach: 12000, engagement_rate: 3.2, updated_at: new Date().toISOString() },
  { platform: 'twitter', followers: 5600, likes: 120, reach: 8500, engagement_rate: 1.5, updated_at: new Date().toISOString() },
];

const MOCK_POSTS = [
  { platform: 'instagram', content: 'Our latest AI strategist is now live! 🚀 Optimize your social media like never before with 2026 data insights.', likes: 342, status: 'published', created_at: new Date(Date.now() - 86400000).toISOString() },
  { platform: 'linkedin', content: 'Exciting trends in B2B marketing for 2026. Data shows LinkedIn peaks shifting to 3PM-8PM on Fridays.', likes: 156, status: 'published', created_at: new Date(Date.now() - 172800000).toISOString() },
  { platform: 'instagram', content: 'How to use emojis to boost engagement by 17%. Check our guide.', likes: 215, status: 'published', created_at: new Date(Date.now() - 259200000).toISOString() },
  { platform: 'instagram', content: 'Scheduled: New product launch teaser.', status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString() },
];

const MOCK_AI_RESULTS = [
  {
    feature_type: 'audience_persona',
    result_json: {
      segments: ['Tech Enthusiasts', 'Creative Professionals', 'Small Business Owners'],
      top_interests: ['Artificial Intelligence', 'Social Media Strategy', 'Digital Marketing'],
      active_hours: '7:00 AM - 10:00 AM EST'
    }
  },
  {
    feature_type: 'weekly_strategy',
    result_json: {
      weekly_goal: 'Increase engagement on Reels by 25%',
      posting_schedule: [
        { day: 'Monday', platform: 'Instagram', time: '7:00 AM', content_type: 'Reel', topic: 'AI for Growth' },
        { day: 'Wednesday', platform: 'LinkedIn', time: '4:00 PM', content_type: 'Article', topic: 'B2B Trends' },
        { day: 'Friday', platform: 'Instagram', time: '5:00 PM', content_type: 'Carousel', topic: 'Strategy Breakdown' }
      ]
    }
  }
];

export async function seedMockData(userId: string) {
  console.log('Seeding mock data for user:', userId);

  // 1. Seed Metrics
  for (const m of MOCK_METRICS) {
    await supabase.from('metrics').upsert({ ...m, user_id: userId }, { onConflict: 'user_id,platform' });
  }

  // 2. Seed Posts
  for (const p of MOCK_POSTS) {
    await supabase.from('posts').upsert({ ...p, user_id: userId });
  }

  // 3. Seed AI Results
  for (const r of MOCK_AI_RESULTS) {
    await supabase.from('ai_results').upsert({ ...r, user_id: userId }, { onConflict: 'user_id,feature_type' });
  }

  console.log('Mock data seeding complete.');
  return { success: true };
}

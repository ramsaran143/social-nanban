
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@1.0.0";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface WeeklyStrategy {
  weekly_goal: string;
  predicted_result: string;
}

serve(async (req) => {
  try {
    // 1. Get all users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    for (const user of users) {
      // 2. Fetch user strategy from ai_results (latest weekly_strategy)
      const { data: strategyData, error: strategyError } = await supabase
        .from('ai_results')
        .select('result_json')
        .eq('user_id', user.id)
        .eq('feature_type', 'weekly_strategy')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (strategyError || !strategyData) continue;

      const strategy: WeeklyStrategy = strategyData.result_json;

      // 3. Send email via Resend
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'strategy@nanban-social.com',
        to: user.email!,
        subject: `Your Weekly Social Media Strategy is Ready!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
            <h1 style="color: #4f46e5;">Strategy Delivered!</h1>
            <p>Hello,</p>
            <p>Your AI strategist has analyzed last week's performance and built a new plan for you.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Weekly Goal</h3>
              <p style="font-size: 18px; font-weight: bold;">${strategy.weekly_goal}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #059669; font-weight: bold;">🚀 Predicted result: ${strategy.predicted_result}</p>
            </div>
            <p>Login to your dashboard to see the full content themes and daily posting schedule.</p>
            <a href="https://nanban-social.com/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Full Strategy</a>
          </div>
        `
      });

      if (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ message: "Emails processed" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

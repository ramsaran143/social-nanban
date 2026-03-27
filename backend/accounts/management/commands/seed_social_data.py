import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from accounts.models import UserProfile
from content.models import GeneratedContent
from analytics.models import AnalyticsData
from scheduler.models import ScheduledPost

class Command(BaseCommand):
    help = 'Seed the database with realistic mock data for Social Nanban'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Create Demo User
        user, created = User.objects.get_or_create(
            username='demo',
            email='demo@nanban.ai'
        )
        if created:
            user.set_password('demo1234')
            user.save()
            self.stdout.write(f'Created user: {user.username}')
        
        # 2. Ensure Profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.company_name = "Nanban Social Labs"
        profile.bio = "Transforming social media with AI-driven strategy."
        profile.instagram_token = "mock_insta_123"
        profile.save()

        # 3. Analytics Data (Last 30 days)
        AnalyticsData.objects.filter(user=user).delete()
        base_followers = 12000
        for i in range(30):
            date = timezone.now().date() - timedelta(days=i)
            AnalyticsData.objects.create(
                user=user,
                platform='Instagram',
                followers=base_followers + (30 - i) * 15,
                engagement=random.uniform(3.5, 5.2),
                reach=random.randint(5000, 15000),
                impressions=random.randint(20000, 45000),
                date=date
            )
        self.stdout.write('Seeded 30 days of analytics.')

        # 4. Scheduled Posts
        ScheduledPost.objects.filter(user=user).delete()
        contents = [
            "🚀 Just launched our new AI strategist! #SocialNanban #FutureOfSocial",
            "Why consistency matters in social media marketing. 🧵",
            "Checking out the latest trends for Spring 2026. 🌸",
            "How to build a loyal community on Instagram.",
            "Behind the scenes at Social Nanban HQ! ☕"
        ]
        
        for i in range(5):
            ScheduledPost.objects.create(
                user=user,
                platform='Instagram',
                content=contents[i],
                scheduled_time=timezone.now() + timedelta(days=i+1, hours=i),
                status='Scheduled'
            )
        
        # 5. Published Posts (Past)
        for i in range(10):
            ScheduledPost.objects.create(
                user=user,
                platform='Instagram',
                content=f"Past Post {i+1}: Success is built on data.",
                scheduled_time=timezone.now() - timedelta(days=i+1),
                status='Published',
                published_at=timezone.now() - timedelta(days=i+1)
            )
        self.stdout.write('Seeded scheduled and past posts.')

        # 6. Generated Content Ideas
        GeneratedContent.objects.filter(user=user).delete()
        GeneratedContent.objects.create(
            user=user,
            business_name="Nanban Social Labs",
            industry="SAAS",
            content_type="Educational",
            tone="Professional",
            target_audience="Founders",
            key_message="AI is your partner, not replacement.",
            generated_text="Unlock the potential of your brand with Social Nanban's AI Strategy. Our engine analyzes real-time trends to keep you ahead.",
            hashtags=["#AI", "#SaaS", "#SocialMarketing"],
            best_time="Tuesday 6:00 PM",
            engagement_score=89,
            tips=["Use a high-contrast thumbnail.", "Ask a question in the first line."]
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all mock data!'))

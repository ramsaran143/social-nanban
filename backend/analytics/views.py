from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import AnalyticsData, PostAnalytics
from .serializers import AnalyticsDataSerializer
from agents.analytics_agent import analyze_performance
import random
from django.utils import timezone
from datetime import timedelta

class AnalyticsSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days_str = request.query_params.get('days', '7')
        days = int(days_str)
        start_date = timezone.now().date() - timedelta(days=days)
        
        # Here we mock analytics data if not present
        data = AnalyticsData.objects.filter(user=request.user, date__gte=start_date)
        if not data.exists():
            # generate some mock data for the user
            for i in range(days):
                for platform in ['Instagram', 'Twitter']:
                    AnalyticsData.objects.create(
                        user=request.user,
                        platform=platform,
                        followers=random.randint(1000, 5000),
                        engagement=random.uniform(1.0, 5.0),
                        reach=random.randint(500, 1500),
                        impressions=random.randint(2000, 5000),
                        date=start_date + timedelta(days=i)
                    )
            data = AnalyticsData.objects.filter(user=request.user, date__gte=start_date)

        summary = {
            'total_followers': sum(d.followers for d in data) // days,
            'avg_engagement_rate': sum(d.engagement for d in data) / len(data) if data else 0,
            'total_reach': sum(d.reach for d in data),
            'total_impressions': sum(d.impressions for d in data),
        }
        
        chart_data = {
            'engagement_over_time': [
                {'date': d.date.strftime('%b %d'), 'engagement': d.engagement} 
                for d in data.filter(platform='Instagram')
            ]
        }
        
        return Response({'summary': summary, 'chart_data': chart_data})

class InstagramAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({"message": "Instagram Mock Data"})

class TwitterAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({"message": "Twitter Mock Data"})

class AIInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch some recent real or mocked data to feed the agent
        analytics_summary = {
            "platform": "Instagram",
            "followers_growth": "5%",
            "avg_engagement": 3.4,
            "top_posts": ["Video on product launch", "Image of team"]
        }
        
        result = analyze_performance(analytics_summary)
        return Response(result)

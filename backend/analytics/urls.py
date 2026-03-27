from django.urls import path
from .views import AnalyticsSummaryView, InstagramAnalyticsView, TwitterAnalyticsView, AIInsightsView

urlpatterns = [
    path('summary/', AnalyticsSummaryView.as_view(), name='analytics_summary'),
    path('instagram/', InstagramAnalyticsView.as_view(), name='instagram_analytics'),
    path('twitter/', TwitterAnalyticsView.as_view(), name='twitter_analytics'),
    path('insights/', AIInsightsView.as_view(), name='analytics_insights'),
]

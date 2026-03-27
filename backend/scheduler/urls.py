from django.urls import path
from .views import ScheduledPostListView, ScheduledPostDetailView, SuggestTimeView, PublishNowView

urlpatterns = [
    path('posts/', ScheduledPostListView.as_view(), name='post_list_create'),
    path('posts/<int:pk>/', ScheduledPostDetailView.as_view(), name='post_detail'),
    path('suggest-time/', SuggestTimeView.as_view(), name='suggest_time'),
    path('publish/<int:pk>/', PublishNowView.as_view(), name='publish_post'),
]

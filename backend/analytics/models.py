from django.db import models
from django.contrib.auth.models import User
from scheduler.models import ScheduledPost

class AnalyticsData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_data')
    platform = models.CharField(max_length=50)
    followers = models.IntegerField(default=0)
    engagement = models.FloatField(default=0.0)
    reach = models.IntegerField(default=0)
    impressions = models.IntegerField(default=0)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.platform} - {self.date}"

class PostAnalytics(models.Model):
    post = models.ForeignKey(ScheduledPost, on_delete=models.CASCADE, related_name='analytics')
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    reach = models.IntegerField(default=0)
    date = models.DateField()
    
    def __str__(self):
        return f"Analytics for post {self.post.id} - {self.date}"

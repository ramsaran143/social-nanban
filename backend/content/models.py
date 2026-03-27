from django.db import models
from django.contrib.auth.models import User

class GeneratedContent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_contents')
    business_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=150)
    content_type = models.CharField(max_length=150)
    tone = models.CharField(max_length=150)
    target_audience = models.CharField(max_length=255)
    key_message = models.TextField()
    
    generated_text = models.TextField()
    hashtags = models.JSONField(default=list)
    best_time = models.CharField(max_length=255)
    engagement_score = models.IntegerField()
    tips = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.business_name} - {self.content_type}"

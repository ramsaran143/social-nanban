from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_pic = models.ImageField(upload_to='profiles/', blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Social Tokens
    instagram_token = models.CharField(max_length=500, blank=True, null=True)
    twitter_token = models.CharField(max_length=500, blank=True, null=True)
    facebook_token = models.CharField(max_length=500, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

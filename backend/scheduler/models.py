from django.db import models
from django.contrib.auth.models import User

class ScheduledPost(models.Model):
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Published', 'Published'),
        ('Failed', 'Failed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_posts')
    platform = models.CharField(max_length=50)
    content = models.TextField()
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.platform} - {self.scheduled_time.strftime('%Y-%m-%d %H:%M')}"

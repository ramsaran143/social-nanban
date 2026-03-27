from rest_framework import serializers
from .models import ScheduledPost

class ScheduledPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledPost
        fields = '__all__'
        read_only_fields = ('user', 'status', 'published_at', 'created_at')

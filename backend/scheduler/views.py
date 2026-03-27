from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import ScheduledPost
from .serializers import ScheduledPostSerializer
from agents.scheduler_agent import suggest_post_time
from django.utils import timezone
from background_task import background

@background(schedule=0)
def publish_to_social_media(post_id):
    # Dummy background task function
    try:
        post = ScheduledPost.objects.get(id=post_id)
        # Attempt publishing (mocked)
        post.status = 'Published'
        post.published_at = timezone.now()
        post.save()
    except ScheduledPost.DoesNotExist:
        pass

class ScheduledPostListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        posts = ScheduledPost.objects.filter(user=request.user).order_by('scheduled_time')
        serializer = ScheduledPostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ScheduledPostSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(user=request.user)
            # Schedule execution
            publish_to_social_media(post.id, schedule=post.scheduled_time)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ScheduledPostDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return ScheduledPost.objects.get(pk=pk, user=user)
        except ScheduledPost.DoesNotExist:
            return None

    def put(self, request, pk):
        post = self.get_object(pk, request.user)
        if not post:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ScheduledPostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        post = self.get_object(pk, request.user)
        if not post:
            return Response(status=status.HTTP_404_NOT_FOUND)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SuggestTimeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        platform = request.data.get('platform')
        industry = request.data.get('industry')
        target_audience = request.data.get('target_audience')
        
        result = suggest_post_time(platform, industry, target_audience)
        return Response(result)

class PublishNowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = ScheduledPost.objects.filter(pk=pk, user=request.user).first()
        if not post:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        # Publish logic
        post.status = 'Published'
        post.published_at = timezone.now()
        post.save()
        return Response({"message": "Successfully published."})

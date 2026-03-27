from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import GeneratedContent
from .serializers import GeneratedContentSerializer
from agents.content_agent import generate_social_content

class GenerateContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        business_name = data.get('business_name')
        industry = data.get('industry')
        content_type = data.get('content_type')
        tone = data.get('tone')
        target_audience = data.get('target_audience')
        key_message = data.get('key_message')

        if not all([business_name, industry, content_type, tone, target_audience, key_message]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Call Claude via agent
            result = generate_social_content(
                business_name, industry, content_type, 
                tone, target_audience, key_message
            )
            
            # Create object but don't save yet unless user asks to save
            content_data = {
                "business_name": business_name,
                "industry": industry,
                "content_type": content_type,
                "tone": tone,
                "target_audience": target_audience,
                "key_message": key_message,
                "generated_text": result.get("content", ""),
                "hashtags": result.get("hashtags", []),
                "best_time": result.get("best_time", "Varies"),
                "engagement_score": result.get("engagement_score", 0),
                "tips": result.get("tips", [])
            }
            return Response(content_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContentHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        contents = GeneratedContent.objects.filter(user=request.user).order_by('-created_at')
        serializer = GeneratedContentSerializer(contents, many=True)
        return Response(serializer.data)

class SaveContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # User wants to save this generated content
            content = GeneratedContent.objects.create(
                user=request.user,
                business_name=request.data.get('business_name', ''),
                industry=request.data.get('industry', ''),
                content_type=request.data.get('content_type', ''),
                tone=request.data.get('tone', ''),
                target_audience=request.data.get('target_audience', ''),
                key_message=request.data.get('key_message', ''),
                generated_text=request.data.get('generated_text', ''),
                hashtags=request.data.get('hashtags', []),
                best_time=request.data.get('best_time', ''),
                engagement_score=request.data.get('engagement_score', 0),
                tips=request.data.get('tips', [])
            )
            serializer = GeneratedContentSerializer(content)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ContentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            content = GeneratedContent.objects.get(pk=pk, user=request.user)
            content.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except GeneratedContent.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

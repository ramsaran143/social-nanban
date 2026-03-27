from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import UserSerializer, UserProfileSerializer
from .models import UserProfile
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        User.objects.filter(id=user.id).update(
            first_name=request.data.get('first_name', user.first_name),
            last_name=request.data.get('last_name', user.last_name),
            email=request.data.get('email', user.email)
        )
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile_data = {
            'company_name': request.data.get('company_name', profile.company_name),
            'bio': request.data.get('bio', profile.bio),
        }
        profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
        
        user.refresh_from_db()
        return Response(UserSerializer(user).data)

class ConnectSocialView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, platform):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        token = request.data.get('token')
        
        if platform == 'instagram':
            profile.instagram_token = token
        elif platform == 'twitter':
            profile.twitter_token = token
            
        profile.save()
        return Response({'message': f'Connected to {platform}'})

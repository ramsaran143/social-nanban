from django.urls import path
from .views import GenerateContentView, ContentHistoryView, SaveContentView, ContentDetailView

urlpatterns = [
    path('generate/', GenerateContentView.as_view(), name='generate_content'),
    path('history/', ContentHistoryView.as_view(), name='content_history'),
    path('save/', SaveContentView.as_view(), name='save_content'),
    path('<int:pk>/', ContentDetailView.as_view(), name='content_detail'),
]

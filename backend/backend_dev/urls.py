import os
from django.contrib import admin # type: ignore
from django.urls import path, include, re_path # type: ignore
from django.conf import settings # type: ignore
from django.conf.urls.static import static # type: ignore
from django.http import FileResponse # type: ignore
from django.views.static import serve as static_serve # type: ignore

def serve_react(request):
    return FileResponse(open(settings.FRONTEND_DIR / 'index.html', 'rb'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/content/', include('content.urls')),
    path('api/scheduler/', include('scheduler.urls')),
    path('api/analytics/', include('analytics.urls')),
    # Assets and Static Files for React
    re_path(r'^assets/(?P<path>.*)$', static_serve, {'document_root': settings.FRONTEND_DIR / 'assets'}),
    path('favicon.ico', static_serve, {'document_root': settings.FRONTEND_DIR, 'path': 'favicon.ico'}),

    # React Catch-All (excluding internal routes)
    re_path(r'^(?!api|admin|static|media|assets|favicon.ico).*$', serve_react),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



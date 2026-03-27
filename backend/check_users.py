import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_dev.settings')
django.setup()

from django.contrib.auth.models import User
for u in User.objects.all():
    print(f"User: {u.username}, Email: {u.email}, is_superuser: {u.is_superuser}")

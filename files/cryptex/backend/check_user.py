#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cryptex_api.settings')
django.setup()

from django.contrib.auth.models import User

user = User.objects.get(username='demo')
print(f"Username: {user.username}")
print(f"Active: {user.is_active}")
print(f"Email: {user.email}")
print(f"Password check (demo1234): {user.check_password('demo1234')}")

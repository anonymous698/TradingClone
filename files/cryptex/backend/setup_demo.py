#!/usr/bin/env python
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cryptex_api.settings')
django.setup()

from django.contrib.auth.models import User
from trading.models import UserProfile

# Create superuser if not exists
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@cryptex.local', 'admin1234')
    print("✓ Superuser 'admin' created (password: admin1234)")
else:
    print("✓ Superuser 'admin' already exists")

# Create demo user
if not User.objects.filter(username='demo').exists():
    demo_user = User.objects.create_user('demo', 'demo@cryptex.local', 'demo1234')
    profile = UserProfile.objects.create(user=demo_user, usd_balance=Decimal('100000.00'))
    print("✓ Demo user 'demo' created (password: demo1234, balance: $100,000)")
else:
    print("✓ Demo user 'demo' already exists")

print("\n✓ Database setup complete!")

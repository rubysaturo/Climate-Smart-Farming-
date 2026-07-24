from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('farmer', 'Farmer'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='farmer')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    sector = models.CharField(max_length=100, default='Sector 74 - Premium Wheat Estate')
    name = models.CharField(max_length=150, blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    
    # Links this Django user to the Supabase Auth user
    supabase_uid = models.UUIDField(unique=True, blank=True, null=True)

    # SMS Alert Subscriptions
    sms_weather = models.BooleanField(default=True)
    sms_soil = models.BooleanField(default=True)
    sms_market = models.BooleanField(default=True)
    sms_app = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

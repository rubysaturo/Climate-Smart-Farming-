from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'name', 'role', 'sector', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'sector')
    search_fields = ('username', 'email', 'name', 'phone_number')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'name', 'phone_number', 'sector', 'profile_picture', 'supabase_uid')}),
        ('SMS Preferences', {'fields': ('sms_weather', 'sms_soil', 'sms_market', 'sms_app')}),
    )

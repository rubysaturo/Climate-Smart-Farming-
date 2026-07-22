from django.contrib import admin
from .models import ChatMessage, WeatherRecord, SoilHealth, CommodityPrice, PestAlert, ConsultMessage, FarmRegion

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender_type', 'farmer', 'timestamp', 'is_read')
    list_filter = ('sender_type', 'is_read', 'timestamp')
    search_fields = ('farmer__username', 'farmer__email', 'message_text')

@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display = ('day_name', 'temp_high', 'temp_low', 'condition', 'date')

@admin.register(SoilHealth)
class SoilHealthAdmin(admin.ModelAdmin):
    list_display = ('sector', 'status', 'ph', 'moisture')

@admin.register(CommodityPrice)
class CommodityPriceAdmin(admin.ModelAdmin):
    list_display = ('crop', 'price_kes', 'demand_level')

@admin.register(PestAlert)
class PestAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'risk_level', 'sector')

@admin.register(ConsultMessage)
class ConsultMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'subject', 'created_at')

@admin.register(FarmRegion)
class FarmRegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'status')

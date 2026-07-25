from django.contrib import admin
from .models import ChatMessage, WeatherRecord, SoilHealth, CommodityPrice, PestAlert, ConsultMessage, FarmRegion


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender_type', 'farmer', 'timestamp', 'is_read')
    list_filter = ('sender_type', 'is_read', 'timestamp')
    search_fields = ('farmer__username', 'farmer__email', 'message_text')
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('farmer')


@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display = ('day_name', 'temp_high', 'temp_low', 'condition', 'date')
    list_filter = ('condition', 'date')
    search_fields = ('day_name',)
    date_hierarchy = 'date'
    list_per_page = 25


@admin.register(SoilHealth)
class SoilHealthAdmin(admin.ModelAdmin):
    list_display = ('sector', 'status', 'ph', 'moisture')
    list_filter = ('status',)
    search_fields = ('sector',)
    readonly_fields = ('last_tested',)
    list_per_page = 25


@admin.register(CommodityPrice)
class CommodityPriceAdmin(admin.ModelAdmin):
    list_display = ('crop', 'price_kes', 'demand_level', 'is_up')
    list_filter = ('demand_level', 'is_up')
    search_fields = ('crop',)
    readonly_fields = ('recorded_at',)
    list_per_page = 25


@admin.register(PestAlert)
class PestAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'risk_level', 'sector', 'issued_at')
    list_filter = ('risk_level', 'sector')
    search_fields = ('title', 'sector', 'description')
    readonly_fields = ('issued_at',)
    list_per_page = 25


@admin.register(ConsultMessage)
class ConsultMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'subject', 'created_at', 'read_by_farmer')
    list_filter = ('read_by_farmer', 'created_at')
    search_fields = ('sender__username', 'subject', 'message')
    readonly_fields = ('created_at', 'replied_at')
    list_per_page = 25

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sender', 'replied_by')


@admin.register(FarmRegion)
class FarmRegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'status', 'crop')
    list_filter = ('status',)
    search_fields = ('name', 'owner', 'crop')
    list_per_page = 25

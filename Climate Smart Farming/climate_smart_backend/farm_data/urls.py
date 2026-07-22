from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (WeatherRecordViewSet, SoilHealthViewSet, CommodityPriceViewSet, 
                    PestAlertViewSet, ConsultMessageViewSet, FarmRegionViewSet, FarmingSearchView, ChatMessageViewSet)

router = DefaultRouter()
router.register(r'weather', WeatherRecordViewSet, basename='weather')
router.register(r'soil', SoilHealthViewSet, basename='soil')
router.register(r'commodities', CommodityPriceViewSet, basename='commodities')
router.register(r'pest-alerts', PestAlertViewSet, basename='pest-alerts')
router.register(r'messages', ConsultMessageViewSet, basename='messages')
router.register(r'regions', FarmRegionViewSet, basename='regions')
router.register(r'chat', ChatMessageViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', FarmingSearchView.as_view(), name='farming_search'),
]

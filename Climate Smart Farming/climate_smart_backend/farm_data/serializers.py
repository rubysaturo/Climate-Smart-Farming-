from rest_framework import serializers
from .models import WeatherRecord, SoilHealth, CommodityPrice, PestAlert, ConsultMessage, FarmRegion, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'name', 'role', 'phone_number', 'sector')

class WeatherRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherRecord
        fields = '__all__'

class SoilHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilHealth
        fields = '__all__'

class CommodityPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommodityPrice
        fields = '__all__'

class PestAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = PestAlert
        fields = '__all__'

class ConsultMessageSerializer(serializers.ModelSerializer):
    sender_details = UserSnippetSerializer(source='sender', read_only=True)
    replied_by_details = UserSnippetSerializer(source='replied_by', read_only=True)

    class Meta:
        model = ConsultMessage
        fields = ('id', 'sender', 'sender_details', 'crop', 'subject', 'message', 
                  'reply', 'replied_at', 'created_at', 'replied_by', 'replied_by_details', 'read_by_farmer')
        read_only_fields = ('id', 'sender', 'created_at', 'replied_at', 'replied_by')

class FarmRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmRegion
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('farmer', 'sender_type', 'is_read')

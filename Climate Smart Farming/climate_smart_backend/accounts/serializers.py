from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'role', 'phone_number', 'sector',
                  'sms_weather', 'sms_soil', 'sms_market', 'sms_app', 'profile_picture',
                  'supabase_uid')
        read_only_fields = ('id', 'role', 'supabase_uid')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'name', 'phone_number', 'sector', 'supabase_uid')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SyncSupabaseUidSerializer(serializers.Serializer):
    supabase_uid = serializers.UUIDField(required=True)

    def validate_supabase_uid(self, value):
        existing = User.objects.filter(supabase_uid=value).first()
        if existing and existing != self.context['request'].user:
            raise serializers.ValidationError("This Supabase account is already linked to another user.")
        return value


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('name', 'email', 'phone_number', 'sector',
                  'sms_weather', 'sms_soil', 'sms_market', 'sms_app', 'profile_picture')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

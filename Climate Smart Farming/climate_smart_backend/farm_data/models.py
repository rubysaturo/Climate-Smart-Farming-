from django.db import models
from django.conf import settings


class WeatherRecord(models.Model):
    day_name = models.CharField(max_length=20)
    temp_high = models.IntegerField()
    temp_low = models.IntegerField()
    condition = models.CharField(max_length=50)
    precip_chance = models.IntegerField()
    wind_speed = models.IntegerField(default=12)
    humidity = models.IntegerField(default=65)
    pressure = models.IntegerField(default=1012)
    visibility = models.IntegerField(default=10)
    date = models.DateField(db_index=True)
    is_today = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Weather Record'
        verbose_name_plural = 'Weather Records'

    def __str__(self):
        return f"{self.day_name}: {self.temp_high}°C/{self.temp_low}°C ({self.condition})"


class SoilHealth(models.Model):
    sector = models.CharField(max_length=100, db_index=True)
    moisture = models.IntegerField()
    ph = models.FloatField()
    nitrogen = models.IntegerField()
    phosphorus = models.IntegerField()
    potassium = models.IntegerField()
    status = models.CharField(max_length=50, default='Optimal')
    last_tested = models.DateTimeField(auto_now=True, null=True, blank=True)
    tips = models.TextField()

    class Meta:
        ordering = ['-last_tested']
        verbose_name = 'Soil Health'
        verbose_name_plural = 'Soil Health Records'

    def __str__(self):
        return f"Soil Health ({self.sector}) - {self.status}"


class CommodityPrice(models.Model):
    crop = models.CharField(max_length=100, db_index=True)
    price_kes = models.IntegerField()
    change_pct = models.FloatField()
    is_up = models.BooleanField(default=True)
    demand_level = models.CharField(max_length=20, default='High')
    volume_tonnes = models.IntegerField(default=100)
    recorded_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['crop']
        verbose_name = 'Commodity Price'
        verbose_name_plural = 'Commodity Prices'

    def __str__(self):
        return f"{self.crop} - KES {self.price_kes}"


class PestAlert(models.Model):
    RISK_CHOICES = (('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low'))
    title = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=20, choices=RISK_CHOICES, db_index=True)
    sector = models.CharField(max_length=100, default='All Sectors', db_index=True)
    description = models.TextField()
    mitigation = models.TextField()
    issued_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ['-issued_at']
        verbose_name = 'Pest Alert'
        verbose_name_plural = 'Pest Alerts'

    def __str__(self):
        return f"[{self.risk_level}] {self.title}"


class ConsultMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='sent_messages', db_index=True
    )
    crop = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    reply = models.TextField(blank=True, null=True)
    replied_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        blank=True, null=True, related_name='replied_consults'
    )
    read_by_farmer = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Consultation Message'
        verbose_name_plural = 'Consultation Messages'

    def __str__(self):
        return f"{self.sender.username} - {self.subject} ({'Replied' if self.reply else 'Pending'})"


class FarmRegion(models.Model):
    STATUS_CHOICES = (
        ('Prospering', 'Prospering'),
        ('Normal', 'Normal'),
        ('Needs Attention', 'Needs Attention'),
    )
    name = models.CharField(max_length=100, db_index=True)
    owner = models.CharField(max_length=150)
    crop = models.CharField(max_length=100)
    area_acres = models.FloatField()
    soil_quality = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Normal', db_index=True)
    lat_center = models.FloatField()
    lng_center = models.FloatField()
    coordinates_json = models.JSONField(default=list)

    class Meta:
        ordering = ['name']
        verbose_name = 'Farm Region'
        verbose_name_plural = 'Farm Regions'

    def __str__(self):
        return f"{self.name} ({self.status})"


class ChatMessage(models.Model):
    SENDER_CHOICES = (
        ('FARMER', 'Farmer'),
        ('AGRO', 'Human Agronomist'),
        ('AI', 'AI Assistant'),
    )
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='chat_messages', db_index=True
    )
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES, default='FARMER')
    message_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self):
        return f"{self.sender_type} -> {self.farmer.username}: {self.message_text[:30]}"

from django.db import models
from django.conf import settings

class WeatherRecord(models.Model):
    day_name = models.CharField(max_length=20) # e.g., 'Today', 'Mon', 'Tue'
    temp_high = models.IntegerField()
    temp_low = models.IntegerField()
    condition = models.CharField(max_length=50) # e.g., 'Sunny', 'Rainy', 'Cloudy', 'Mostly Clear'
    precip_chance = models.IntegerField() # e.g., 10 (representing 10%)
    wind_speed = models.IntegerField(default=12) # km/h
    humidity = models.IntegerField(default=65) # %
    pressure = models.IntegerField(default=1012) # hPa
    visibility = models.IntegerField(default=10) # km
    date = models.DateField()
    is_today = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.day_name}: {self.temp_high}°C/{self.temp_low}°C ({self.condition})"


class SoilHealth(models.Model):
    sector = models.CharField(max_length=100) # e.g. 'Sector 74 - Premium Wheat Estate'
    moisture = models.IntegerField() # e.g. 75 (75%)
    ph = models.FloatField() # e.g. 6.5
    nitrogen = models.IntegerField() # mg/kg
    phosphorus = models.IntegerField() # mg/kg
    potassium = models.IntegerField() # mg/kg
    status = models.CharField(max_length=50, default='Optimal')
    last_tested = models.DateTimeField(auto_now=True, null=True, blank=True)
    tips = models.TextField()

    def __str__(self):
        return f"Soil Health ({self.sector}) - {self.status}"


class CommodityPrice(models.Model):
    crop = models.CharField(max_length=100) # e.g., 'Wheat (90kg Bag)'
    price_kes = models.IntegerField() # e.g. 4200
    change_pct = models.FloatField() # e.g. 1.2
    is_up = models.BooleanField(default=True)
    demand_level = models.CharField(max_length=20, default='High') # High, Moderate, Low
    volume_tonnes = models.IntegerField(default=100)
    recorded_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.crop} - KES {self.price_kes}"


class PestAlert(models.Model):
    title = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=20, choices=(('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low')))
    sector = models.CharField(max_length=100, default='All Sectors')
    description = models.TextField()
    mitigation = models.TextField()
    issued_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"[{self.risk_level}] {self.title}"


class ConsultMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    crop = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    reply = models.TextField(blank=True, null=True)
    replied_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='replied_consults'
    )
    read_by_farmer = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} - {self.subject} ({'Replied' if self.reply else 'Pending'})"


class FarmRegion(models.Model):
    STATUS_CHOICES = (
        ('Prospering', 'Prospering'),
        ('Normal', 'Normal'),
        ('Needs Attention', 'Needs Attention'),
    )
    name = models.CharField(max_length=100)
    owner = models.CharField(max_length=150)
    crop = models.CharField(max_length=100)
    area_acres = models.FloatField()
    soil_quality = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Normal')
    lat_center = models.FloatField()
    lng_center = models.FloatField()
    coordinates_json = models.TextField() # stores coordinates e.g. "[[lat, lng], [lat, lng], ...]"

    def __str__(self):
        return f"{self.name} ({self.status})"

class ChatMessage(models.Model):
    SENDER_CHOICES = (
        ('FARMER', 'Farmer'),
        ('AGRO', 'Human Agronomist'),
        ('AI', 'AI Assistant'),
    )
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES, default='FARMER')
    message_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender_type} -> {self.farmer.username}: {self.message_text[:30]}"

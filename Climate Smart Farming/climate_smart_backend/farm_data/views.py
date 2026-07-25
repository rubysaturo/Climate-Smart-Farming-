from urllib.parse import quote
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import WeatherRecord, SoilHealth, CommodityPrice, PestAlert, ConsultMessage, FarmRegion, ChatMessage
from .serializers import (WeatherRecordSerializer, SoilHealthSerializer, CommodityPriceSerializer,
                          PestAlertSerializer, ConsultMessageSerializer, FarmRegionSerializer, ChatMessageSerializer)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class WeatherRecordViewSet(viewsets.ModelViewSet):
    queryset = WeatherRecord.objects.all()
    serializer_class = WeatherRecordSerializer
    permission_classes = [IsAdminOrReadOnly]


class SoilHealthViewSet(viewsets.ModelViewSet):
    queryset = SoilHealth.objects.all()
    serializer_class = SoilHealthSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['get'])
    def by_sector(self, request):
        sector = request.query_params.get('sector', '')
        if sector:
            soil = SoilHealth.objects.filter(sector__icontains=sector).order_by('-last_tested').first()
            if soil:
                return Response(SoilHealthSerializer(soil).data)

        first_soil = SoilHealth.objects.order_by('-last_tested').first()
        if first_soil:
            return Response(SoilHealthSerializer(first_soil).data)
        return Response({"error": "No soil record found"}, status=status.HTTP_404_NOT_FOUND)


class CommodityPriceViewSet(viewsets.ModelViewSet):
    queryset = CommodityPrice.objects.all()
    serializer_class = CommodityPriceSerializer
    permission_classes = [IsAdminOrReadOnly]


class PestAlertViewSet(viewsets.ModelViewSet):
    queryset = PestAlert.objects.all()
    serializer_class = PestAlertSerializer
    permission_classes = [IsAdminOrReadOnly]


class ConsultMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ConsultMessage.objects.select_related('sender', 'replied_by').all()
        return ConsultMessage.objects.select_related('sender', 'replied_by').filter(sender=user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reply(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized. Only admins can reply."}, status=status.HTTP_403_FORBIDDEN)

        message = self.get_object()
        reply_text = request.data.get('reply', '')
        if not reply_text:
            return Response({"error": "Reply text is required."}, status=status.HTTP_400_BAD_REQUEST)

        message.reply = reply_text
        message.replied_at = timezone.now()
        message.replied_by = request.user
        message.read_by_farmer = False
        message.save()

        return Response(ConsultMessageSerializer(message).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.read_by_farmer = True
        message.save()
        return Response({"status": "Message marked as read"})


class FarmRegionViewSet(viewsets.ModelViewSet):
    queryset = FarmRegion.objects.all()
    serializer_class = FarmRegionSerializer
    permission_classes = [IsAdminOrReadOnly]


class FarmingSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').lower().strip()
        if not query:
            return Response({"results": []})

        knowledge_base = [
            {
                "title": "Optimizing Wheat Yields in Central Kenya",
                "category": "Crops",
                "source": "Kenya Agricultural and Livestock Research Organisation (KALRO)",
                "snippet": "Wheat crops thrive in soils with a pH of 6.0 - 7.5. For premium yield, apply NPK fertilizer (ratio 23:23:0) at planting and top dress with CAN at 4-6 weeks.",
                "url": "https://www.kalro.org/wheat-tips",
                "keywords": ["wheat", "npk", "fertilizer", "planting", "crop"]
            },
            {
                "title": "Fall Armyworm (Spodoptera frugiperda) Management",
                "category": "Pests",
                "source": "FAO East Africa",
                "snippet": "Early detection is key for fall armyworm control. Handpick egg masses or spray Neem oil extract for organic treatment. For severe outbreaks, use registered chemical sprays.",
                "url": "http://www.fao.org/pest-alerts/armyworm",
                "keywords": ["armyworm", "pest", "caterpillar", "worm", "insect", "spray"]
            },
            {
                "title": "Maize Post-Harvest Management and Sales Tips",
                "category": "Sales",
                "source": "NCPB Kenya",
                "snippet": "To secure high commodity sales, dry maize to a moisture content below 13.5% before storage in hermetic bags. Current grain prices range between KES 3,000 and KES 4,000 per 90kg bag.",
                "url": "https://www.ncpb.co.ke/grains",
                "keywords": ["maize", "price", "sale", "store", "post-harvest", "bag", "kes"]
            },
            {
                "title": "Soil Moisture Conservation and Drip Irrigation Advantages",
                "category": "Land",
                "source": "Smart Water Solutions",
                "snippet": "Drip irrigation reduces water consumption by up to 60% compared to sprinkler systems. Cover cropping with legumes helps retain soil moisture levels above 70%.",
                "url": "https://www.smartwater.or.ke",
                "keywords": ["soil", "water", "irrigation", "moisture", "drip", "conservation"]
            },
            {
                "title": "Organic Farming & Market Demands in East Africa",
                "category": "Sales",
                "source": "Organic Trade Association",
                "snippet": "Organic crops command a premium price markup of 25-40% in Nairobi markets. High demand is noted for pesticide-free vegetables, wheat bran, and export-quality soybeans.",
                "url": "https://www.organic-ea.org/markets",
                "keywords": ["organic", "price", "sale", "demand", "market", "premium"]
            },
            {
                "title": "Soybean Planting Guidelines for Smallholder Farmers",
                "category": "Crops",
                "source": "Ministry of Agriculture Kenya",
                "snippet": "Soybeans require inoculation with Rhizobium bacteria to enhance nitrogen fixation. Plant seeds at a depth of 2-5cm when soil temperature reaches 20°C.",
                "url": "http://www.kilimo.go.ke/soybean",
                "keywords": ["soybean", "rhizobium", "nitrogen", "seed", "plant"]
            }
        ]

        results = []
        for article in knowledge_base:
            match_score = 0
            if query in article["title"].lower():
                match_score += 10
            if query in article["snippet"].lower():
                match_score += 5

            for keyword in article["keywords"]:
                if keyword in query or query in keyword:
                    match_score += 3

            if match_score > 0:
                results.append({
                    "title": article["title"],
                    "category": article["category"],
                    "source": article["source"],
                    "snippet": article["snippet"],
                    "url": article["url"],
                    "score": match_score
                })

        results.sort(key=lambda x: x["score"], reverse=True)

        if not results:
            results.append({
                "title": f"Web Search: '{query}' Agricultural Insights",
                "category": "General Search",
                "source": "Integrated Smart Farming Search Index",
                "snippet": f"Your search for '{query}' returned no direct matching documents. Based on global agricultural feeds, we recommend consulting our localized agronomist inbox or verifying regional soil diagnostics for detailed answers.",
                "url": f"https://www.google.com/search?q=agriculture+{quote(query)}",
                "score": 1
            })

        return Response({"results": results})


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ChatMessage.objects.select_related('farmer').all()
        return ChatMessage.objects.select_related('farmer').filter(farmer=user)

    def perform_create(self, serializer):
        import random
        farmer_message = serializer.save(farmer=self.request.user, sender_type='FARMER')

        mode = self.request.data.get('mode', 'AI')

        if mode == 'AI':
            mock_replies = [
                "That's a great question. Based on regional data, I recommend testing your soil pH first.",
                "I've analyzed your request. You might want to consider crop rotation for the next season.",
                "Thank you for reaching out. We will monitor the weather patterns for your region to provide a better estimate.",
                "Pest management is crucial right now. Have you checked the Pest Alerts tab for recent outbreaks?"
            ]
            ai_reply = random.choice(mock_replies)
            ChatMessage.objects.create(
                farmer=self.request.user,
                sender_type='AI',
                message_text=ai_reply
            )

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend # Import DjangoFilterBackend
from django.db.models import F, Sum # For aggregation
from .models import Part, Order, Shipment, StockKPI
from .serializers import PartSerializer, OrderSerializer, ShipmentSerializer, StockKPISerializer
from .filters import OrderFilter # Import OrderFilter

class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer

    @action(detail=False, methods=['get'])
    def total_stock_value(self, request):
        total_value = Part.objects.aggregate(
            total_value=Sum(F('StockLevel') * F('UnitPrice'))
        )['total_value'] or 0
        return Response({'total_stock_value': total_value})

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend] # Add DjangoFilterBackend
    filterset_class = OrderFilter # Set filterset_class

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer

class StockKPIViewSet(viewsets.ModelViewSet):
    queryset = StockKPI.objects.all()
    serializer_class = StockKPISerializer

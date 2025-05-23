from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartViewSet, OrderViewSet, ShipmentViewSet, StockKPIViewSet

router = DefaultRouter()
router.register(r'parts', PartViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'shipments', ShipmentViewSet)
router.register(r'stock-kpis', StockKPIViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

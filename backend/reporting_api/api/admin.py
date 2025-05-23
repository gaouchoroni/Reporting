from django.contrib import admin
from .models import Part, Order, OrderItem, Shipment, StockKPI

admin.site.register(Part)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Shipment)
admin.site.register(StockKPI)

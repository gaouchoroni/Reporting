from rest_framework import serializers
from .models import Part, Order, OrderItem, Shipment, StockKPI

class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'OrderDate', 'Status', 'Supplier', 'ExpectedDeliveryDate', 'TotalAmount', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(Order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance.Status = validated_data.get('Status', instance.Status)
        instance.Supplier = validated_data.get('Supplier', instance.Supplier)
        instance.ExpectedDeliveryDate = validated_data.get('ExpectedDeliveryDate', instance.ExpectedDeliveryDate)
        instance.TotalAmount = validated_data.get('TotalAmount', instance.TotalAmount)
        instance.save()

        if items_data is not None:
            # Simple way: delete old items and create new ones
            # More complex logic can be added here for updating existing items
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(Order=instance, **item_data)
        return instance

class ShipmentSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())
    calculated_lead_time = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = ['id', 'order', 'ShipmentDate', 'EstimatedDeliveryDate', 'ActualDeliveryDate', 'TrackingNumber', 'Carrier', 'Status', 'calculated_lead_time']

    def get_calculated_lead_time(self, obj):
        if obj.ShipmentDate and obj.ActualDeliveryDate:
            return (obj.ActualDeliveryDate - obj.ShipmentDate).days
        return None

class StockKPISerializer(serializers.ModelSerializer):
    Part = serializers.PrimaryKeyRelatedField(queryset=Part.objects.all(), allow_null=True, required=False)
    PartName = serializers.StringRelatedField(source='Part', read_only=True) # For displaying part name

    class Meta:
        model = StockKPI
        fields = ['id', 'DateRecorded', 'Name', 'Value', 'Part', 'PartName', 'Notes']
        read_only_fields = ['DateRecorded'] # DateRecorded is auto_now_add

    def to_representation(self, instance):
        """Customize representation to show PartName instead of Part ID for read operations."""
        representation = super().to_representation(instance)
        # If Part is not null, PartName will be populated by StringRelatedField.
        # If Part is null, remove PartName to avoid confusion, or ensure it's handled gracefully.
        if instance.Part is None:
            representation['PartName'] = None 
        return representation

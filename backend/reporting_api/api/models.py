from django.db import models

class Part(models.Model):
    PartName = models.CharField(max_length=255, unique=True)
    Description = models.TextField(blank=True, null=True)
    StockLevel = models.IntegerField(default=0)
    ReorderPoint = models.IntegerField(default=0, blank=True, null=True)
    Supplier = models.CharField(max_length=255, blank=True, null=True)
    UnitPrice = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.PartName

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    OrderDate = models.DateTimeField(auto_now_add=True)
    Status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    Supplier = models.CharField(max_length=255, blank=True, null=True)
    ExpectedDeliveryDate = models.DateField(blank=True, null=True)
    TotalAmount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Order {self.id} - {self.Status}"

class OrderItem(models.Model):
    Order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    Part = models.ForeignKey(Part, on_delete=models.PROTECT)
    Quantity = models.IntegerField()
    PriceAtOrder = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.Quantity} of {self.Part.PartName} for Order {self.Order.id}"

class Shipment(models.Model):
    SHIPMENT_STATUS_CHOICES = [
        ('Preparing', 'Preparing'),
        ('InTransit', 'InTransit'),
        ('Delivered', 'Delivered'),
        ('Delayed', 'Delayed'),
    ]
    Order = models.OneToOneField(Order, on_delete=models.CASCADE)
    ShipmentDate = models.DateField(blank=True, null=True)
    EstimatedDeliveryDate = models.DateField(blank=True, null=True)
    ActualDeliveryDate = models.DateField(blank=True, null=True)
    TrackingNumber = models.CharField(max_length=100, blank=True, null=True)
    Carrier = models.CharField(max_length=100, blank=True, null=True)
    Status = models.CharField(max_length=50, choices=SHIPMENT_STATUS_CHOICES, default='Preparing')

    def __str__(self):
        return f"Shipment for Order {self.Order.id} - {self.Status}"

class StockKPI(models.Model):
    KPI_NAME_CHOICES = [
        ('StockTurnover', 'StockTurnover'),
        ('AverageStockValue', 'AverageStockValue'),
        ('OutOfStockRate', 'OutOfStockRate'),
        ('FillRate', 'FillRate'),
    ]
    DateRecorded = models.DateField(auto_now_add=True)
    Name = models.CharField(max_length=100, choices=KPI_NAME_CHOICES)
    Value = models.DecimalField(max_digits=15, decimal_places=2)
    Part = models.ForeignKey(Part, on_delete=models.SET_NULL, null=True, blank=True)
    Notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.Name} on {self.DateRecorded}"

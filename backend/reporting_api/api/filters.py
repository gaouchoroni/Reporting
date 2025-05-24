import django_filters as filters
from .models import Order

class OrderFilter(filters.FilterSet):
    OrderDate = filters.DateFromToRangeFilter()
    # This will create `OrderDate_after` and `OrderDate_before` query parameters.
    # The frontend currently sends `OrderDate__gte` and `OrderDate__lte`.
    # For this task, we'll stick to the backend instruction.
    # If frontend compatibility is critical, a custom method or different filter types might be needed
    # or the frontend query params would need to be adjusted.

    Status = filters.CharFilter(lookup_expr='exact') # Explicitly define for clarity

    class Meta:
        model = Order
        fields = [
            'Status', 
            'OrderDate', # This refers to the DateFromToRangeFilter defined above
        ]

from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import Order, Part # Assuming Part is needed for OrderItem, though not directly tested here

class OrderFilteringTests(APITestCase):
    def setUp(self):
        self.username = 'testuser_orders'
        self.password = 'testpassword123_orders'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.orders_url = reverse('order-list') # Assuming 'order-list' is the name for /api/orders/

        # Create some sample orders for testing
        self.part1 = Part.objects.create(PartName="Test Part 1", UnitPrice=10.00, StockLevel=100) # Required for OrderItem if Order creation needs it

        self.order1 = Order.objects.create(
            Status='Pending', 
            OrderDate=timezone.now() - timedelta(days=5),
            Supplier='Supplier A',
            TotalAmount=100.00
        )
        self.order2 = Order.objects.create(
            Status='Shipped', 
            OrderDate=timezone.now() - timedelta(days=3),
            Supplier='Supplier B',
            TotalAmount=200.00
        )
        self.order3 = Order.objects.create(
            Status='Pending', 
            OrderDate=timezone.now() - timedelta(days=1),
            Supplier='Supplier C',
            TotalAmount=150.00
        )
        self.order4 = Order.objects.create(
            Status='Delivered', 
            OrderDate=timezone.now() - timedelta(days=10),
            Supplier='Supplier D',
            TotalAmount=50.00
        )
        self.all_orders = [self.order1, self.order2, self.order3, self.order4]

    def test_list_orders_no_filters(self):
        """
        Ensure all orders are returned when no filters are applied.
        """
        response = self.client.get(self.orders_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(self.all_orders))

    def test_filter_orders_by_status_pending(self):
        """
        Test filtering orders by 'Pending' status.
        """
        response = self.client.get(self.orders_url, {'Status': 'Pending'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_order_ids = {self.order1.id, self.order3.id}
        returned_order_ids = {order['id'] for order in response.data}
        
        self.assertEqual(len(response.data), 2)
        self.assertEqual(returned_order_ids, expected_order_ids)

    def test_filter_orders_by_status_shipped(self):
        """
        Test filtering orders by 'Shipped' status.
        """
        response = self.client.get(self.orders_url, {'Status': 'Shipped'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.order2.id)

    def test_filter_orders_orderdate_after(self):
        """
        Test filtering orders with OrderDate after a specific date.
        """
        filter_date = (timezone.now() - timedelta(days=4)).strftime('%Y-%m-%d')
        response = self.client.get(self.orders_url, {'OrderDate_after': filter_date}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Expected: order2 (3 days ago), order3 (1 day ago)
        expected_order_ids = {self.order2.id, self.order3.id}
        returned_order_ids = {order['id'] for order in response.data}
        
        self.assertEqual(len(response.data), 2)
        self.assertEqual(returned_order_ids, expected_order_ids)

    def test_filter_orders_orderdate_before(self):
        """
        Test filtering orders with OrderDate before a specific date.
        """
        filter_date = (timezone.now() - timedelta(days=4)).strftime('%Y-%m-%d')
        response = self.client.get(self.orders_url, {'OrderDate_before': filter_date}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Expected: order1 (5 days ago), order4 (10 days ago)
        expected_order_ids = {self.order1.id, self.order4.id}
        returned_order_ids = {order['id'] for order in response.data}
        
        self.assertEqual(len(response.data), 2)
        self.assertEqual(returned_order_ids, expected_order_ids)

    def test_filter_orders_orderdate_range(self):
        """
        Test filtering orders within a date range.
        """
        date_after = (timezone.now() - timedelta(days=6)).strftime('%Y-%m-%d')
        date_before = (timezone.now() - timedelta(days=2)).strftime('%Y-%m-%d')
        
        response = self.client.get(self.orders_url, {
            'OrderDate_after': date_after,
            'OrderDate_before': date_before
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Expected: order1 (5 days ago), order2 (3 days ago)
        expected_order_ids = {self.order1.id, self.order2.id}
        returned_order_ids = {order['id'] for order in response.data}
        
        self.assertEqual(len(response.data), 2)
        self.assertEqual(returned_order_ids, expected_order_ids)

    def test_filter_orders_by_status_and_date_range(self):
        """
        Test filtering orders by status and a date range.
        """
        date_after = (timezone.now() - timedelta(days=6)).strftime('%Y-%m-%d') # Includes order1, order2, order3
        date_before = timezone.now().strftime('%Y-%m-%d') # Includes all recent
        
        response = self.client.get(self.orders_url, {
            'Status': 'Pending',
            'OrderDate_after': date_after,
            'OrderDate_before': date_before 
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Expected: order1 (Pending, 5 days ago), order3 (Pending, 1 day ago)
        expected_order_ids = {self.order1.id, self.order3.id}
        returned_order_ids = {order['id'] for order in response.data}
        
        self.assertEqual(len(response.data), 2)
        self.assertEqual(returned_order_ids, expected_order_ids)

    def test_filter_orders_no_match(self):
        """
        Test filtering that results in no matching orders.
        """
        response = self.client.get(self.orders_url, {'Status': 'NonExistentStatus'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        filter_date = (timezone.now() + timedelta(days=1)).strftime('%Y-%m-%d') # Future date
        response = self.client.get(self.orders_url, {'OrderDate_after': filter_date}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

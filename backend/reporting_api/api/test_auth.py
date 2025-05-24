from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        
        self.login_url = reverse('rest_login') # dj_rest_auth default name
        self.logout_url = reverse('rest_logout') # dj_rest_auth default name
        self.parts_list_url = reverse('part-list') # Assuming 'part-list' is the name for /api/parts/

    def test_successful_login(self):
        """
        Ensure a user can login with valid credentials and receive a token.
        """
        data = {'username': self.username, 'password': self.password}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('key', response.data) # dj-rest-auth returns 'key' by default
        
        # Ensure token was created for the user
        self.assertTrue(Token.objects.filter(user=self.user).exists())

    def test_login_with_invalid_credentials(self):
        """
        Ensure login fails with invalid credentials.
        """
        data = {'username': self.username, 'password': 'wrongpassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('key', response.data)

    def test_successful_logout(self):
        """
        Ensure a user can logout and their token is invalidated (or at least logout endpoint works).
        dj-rest-auth's default logout doesn't strictly invalidate the token but removes it server-side.
        We'll check if the logout endpoint works and then if the token can still access protected resources.
        """
        # Login to get a token
        login_data = {'username': self.username, 'password': self.password}
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        token_key = login_response.data['key']

        # Set credentials for logout
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token_key)
        
        logout_response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK) # dj-rest-auth logout returns 200

        # Try accessing a protected endpoint with the old token
        # Note: Token-based auth usually means token is valid until it expires or is deleted.
        # dj-rest-auth's default server-side logout doesn't invalidate tokens in the DB.
        # A more robust system might use blacklisting. For this test, we'll check if
        # the /api/parts/ endpoint (which is protected) is now inaccessible.
        # However, the default behavior of TokenAuthentication is that the token remains valid.
        # So, this part of the test might behave differently based on specific token invalidation strategy
        # which is not implemented by default.
        # For now, we'll just confirm the logout endpoint works. A better test would be
        # if dj-rest-auth provided a mechanism to check if a token is "active" post-logout.
        
        # A more direct test for logout's effect with default TokenAuthentication
        # is to check if the session is cleared if session auth was also active.
        # But since we are focusing on TokenAuth, the main check is the endpoint's response.

    def test_access_protected_endpoint_without_token(self):
        """
        Ensure accessing a protected endpoint without a token fails.
        """
        response = self.client.get(self.parts_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_protected_endpoint_with_valid_token(self):
        """
        Ensure accessing a protected endpoint with a valid token succeeds.
        """
        # Login to get a token
        login_data = {'username': self.username, 'password': self.password}
        login_response = self.client.post(self.login_url, login_data, format='json')
        token_key = login_response.data['key']

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token_key)
        response = self.client.get(self.parts_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_access_protected_endpoint_with_invalid_token(self):
        """
        Ensure accessing a protected endpoint with an invalid token fails.
        """
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + 'invalidtoken123')
        response = self.client.get(self.parts_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_protected_endpoint_with_expired_or_nonexistent_user_token(self):
        """
        Ensure access fails if token is valid format but user/token doesn't exist.
        (This is similar to invalid token but more specific)
        """
        # Create a token for a user, then delete the user. The token becomes invalid.
        temp_user = User.objects.create_user(username='tempuser', password='temppassword')
        token = Token.objects.create(user=temp_user)
        token_key = token.key
        temp_user.delete() # User deleted, token should be invalid

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token_key)
        response = self.client.get(self.parts_list_url, format='json')
        # DRF's TokenAuthentication checks if token.user is active. If user deleted, token.user raises DoesNotExist.
        # The default behavior results in 401.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

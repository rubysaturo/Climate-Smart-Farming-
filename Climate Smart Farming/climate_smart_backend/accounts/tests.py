from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegistrationTest(APITestCase):
    """POST /api/auth/register/"""

    def test_register_creates_django_user(self):
        data = {
            "username": "farmer1",
            "email": "farmer1@example.com",
            "password": "securepass123",
            "name": "Test Farmer",
            "phone_number": "+254700000000",
            "sector": "Nakuru",
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "User registered successfully")
        self.assertTrue(User.objects.filter(username="farmer1").exists())
        user = User.objects.get(username="farmer1")
        self.assertEqual(user.email, "farmer1@example.com")
        self.assertEqual(user.name, "Test Farmer")
        self.assertTrue(user.check_password("securepass123"))

    def test_register_duplicate_username_rejected(self):
        User.objects.create_user(username="farmer1", email="a@b.com", password="pass12345")
        data = {
            "username": "farmer1",
            "email": "other@example.com",
            "password": "securepass123",
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_rejected(self):
        User.objects.create_user(username="farmer1", email="dup@example.com", password="pass12345")
        data = {
            "username": "farmer2",
            "email": "dup@example.com",
            "password": "securepass123",
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password_rejected(self):
        data = {
            "username": "farmer1",
            "email": "f@example.com",
            "password": "short",
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_email_rejected(self):
        data = {
            "username": "farmer1",
            "password": "securepass123",
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_stores_supabase_uid(self):
        import uuid
        supabase_uid = uuid.uuid4()
        data = {
            "username": "farmer1",
            "email": "farmer1@example.com",
            "password": "securepass123",
            "supabase_uid": str(supabase_uid),
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="farmer1")
        self.assertEqual(str(user.supabase_uid), str(supabase_uid))

    def test_register_returns_user_data(self):
        data = {
            "username": "farmer1",
            "email": "farmer1@example.com",
            "password": "securepass123",
            "name": "Test Farmer",
        }
        response = self.client.post("/api/auth/register/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "farmer1")
        self.assertEqual(response.data["user"]["email"], "farmer1@example.com")


class LoginByUsernameTest(APITestCase):
    """POST /api/auth/login/ with username"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="farmer1",
            email="farmer1@example.com",
            password="securepass123",
            name="Test Farmer",
        )

    def test_login_with_username(self):
        response = self.client.post("/api/auth/login/", {
            "username": "farmer1",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "farmer1")
        self.assertEqual(response.data["user"]["email"], "farmer1@example.com")

    def test_login_with_wrong_password(self):
        response = self.client.post("/api/auth/login/", {
            "username": "farmer1",
            "password": "wrongpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_nonexistent_user(self):
        response = self.client.post("/api/auth/login/", {
            "username": "nobody",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LoginByEmailTest(APITestCase):
    """POST /api/auth/login/ with email address"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="farmer1",
            email="farmer1@example.com",
            password="securepass123",
        )

    def test_login_with_email(self):
        response = self.client.post("/api/auth/login/", {
            "username": "farmer1@example.com",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["username"], "farmer1")

    def test_login_with_email_case_insensitive(self):
        response = self.client.post("/api/auth/login/", {
            "username": "FARMER1@EXAMPLE.COM",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_with_nonexistent_email(self):
        response = self.client.post("/api/auth/login/", {
            "username": "nobody@example.com",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class JWTTokenTest(APITestCase):
    """JWT token lifecycle"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="farmer1",
            email="farmer1@example.com",
            password="securepass123",
            role="farmer",
        )

    def test_tokens_contain_user_data(self):
        response = self.client.post("/api/auth/login/", {
            "username": "farmer1",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("id", response.data["user"])
        self.assertEqual(response.data["user"]["role"], "farmer")

    def test_refresh_token(self):
        login_response = self.client.post("/api/auth/login/", {
            "username": "farmer1",
            "password": "securepass123",
        })
        refresh_token = login_response.data["refresh"]

        response = self.client.post("/api/auth/login/refresh/", {
            "refresh": refresh_token,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_expired_token_rejected(self):
        from datetime import timedelta
        from django.utils import timezone
        from rest_framework_simplejwt.tokens import AccessToken

        token = AccessToken()
        token.set_exp(lifetime=timedelta(seconds=-1))
        token["user_id"] = self.user.pk

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(token)}")
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_valid_token_accepted(self):
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(token.access_token)}")
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "farmer1")


class LogoutTest(APITestCase):
    """POST /api/auth/logout/"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="farmer1",
            email="farmer1@example.com",
            password="securepass123",
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.refresh_token = str(refresh)

    def test_logout_blacklists_refresh_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post("/api/auth/logout/", {"refresh": self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        refresh_response = self.client.post("/api/auth/login/refresh/", {
            "refresh": self.refresh_token,
        })
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_authentication(self):
        response = self.client.post("/api/auth/logout/", {"refresh": self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_with_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post("/api/auth/logout/", {"refresh": "invalid-token"})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class ProfileTest(APITestCase):
    """GET/PATCH /api/auth/me/"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="farmer1",
            email="farmer1@example.com",
            password="securepass123",
            name="Test Farmer",
            sector="Nakuru",
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_get_profile(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "farmer1")
        self.assertEqual(response.data["email"], "farmer1@example.com")
        self.assertEqual(response.data["name"], "Test Farmer")

    def test_update_profile(self):
        response = self.client.patch("/api/auth/me/", {"name": "Updated Name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Updated Name")

    def test_profile_requires_authentication(self):
        self.client.credentials()
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_excludes_sensitive_fields(self):
        response = self.client.get("/api/auth/me/")
        self.assertNotIn("password", response.data)
        self.assertNotIn("supabase_uid", response.data)
        self.assertNotIn("last_login", response.data)


class EndToEndAuthFlowTest(APITestCase):
    """Full register → login → profile → logout flow"""

    def test_complete_auth_flow(self):
        register_data = {
            "username": "newfarmer",
            "email": "newfarmer@example.com",
            "password": "securepass123",
            "name": "New Farmer",
            "phone_number": "+254700000000",
            "sector": "Kiambu",
        }

        reg_response = self.client.post("/api/auth/register/", register_data)
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(User.objects.filter(username="newfarmer").exists())

        login_response = self.client.post("/api/auth/login/", {
            "username": "newfarmer",
            "password": "securepass123",
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access_token = login_response.data["access"]
        refresh_token = login_response.data["refresh"]
        self.assertEqual(login_response.data["user"]["username"], "newfarmer")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        profile_response = self.client.get("/api/auth/me/")
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["email"], "newfarmer@example.com")

        update_response = self.client.patch("/api/auth/me/", {"name": "Updated Farmer"})
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        logout_response = self.client.post("/api/auth/logout/", {"refresh": refresh_token})
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        after_logout = self.client.get("/api/auth/me/")
        self.assertIn(after_logout.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_200_OK])

    def test_register_then_login_with_email(self):
        self.client.post("/api/auth/register/", {
            "username": "farmer2",
            "email": "farmer2@example.com",
            "password": "securepass123",
        })

        login_response = self.client.post("/api/auth/login/", {
            "username": "farmer2@example.com",
            "password": "securepass123",
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data["user"]["username"], "farmer2")

    def test_duplicate_registration_blocked(self):
        data = {
            "username": "farmer3",
            "email": "farmer3@example.com",
            "password": "securepass123",
        }
        r1 = self.client.post("/api/auth/register/", data)
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)

        r2 = self.client.post("/api/auth/register/", data)
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)


class AuthBackendTest(TestCase):
    """EmailOrUsernameBackend unit tests"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="securepass123",
        )

    def test_authenticate_with_username(self):
        from django.contrib.auth import authenticate
        user = authenticate(username="testuser", password="securepass123")
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "testuser")

    def test_authenticate_with_email(self):
        from django.contrib.auth import authenticate
        user = authenticate(username="test@example.com", password="securepass123")
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "testuser")

    def test_authenticate_with_wrong_password(self):
        from django.contrib.auth import authenticate
        user = authenticate(username="testuser", password="wrong")
        self.assertIsNone(user)

    def test_authenticate_with_nonexistent_user(self):
        from django.contrib.auth import authenticate
        user = authenticate(username="nobody", password="securepass123")
        self.assertIsNone(user)

    def test_authenticate_with_none_credentials(self):
        from django.contrib.auth import authenticate
        user = authenticate(username=None, password="securepass123")
        self.assertIsNone(user)
        user = authenticate(username="testuser", password=None)
        self.assertIsNone(user)

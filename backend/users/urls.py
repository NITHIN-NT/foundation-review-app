from django.urls import path
from .views import CustomObtainAuthToken, UserProfileView, ChangePasswordView, AllUsersListView, UserDetailView

urlpatterns = [
    path('login/', CustomObtainAuthToken.as_view(), name='api_token_auth'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('all/', AllUsersListView.as_view(), name='all_users'),
    path('register/', AllUsersListView.as_view(), name='register_user'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]

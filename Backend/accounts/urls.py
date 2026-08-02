from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]

profile_urlpatterns = [
    path('', views.ProfileDetailView.as_view(), name='profile'),
]

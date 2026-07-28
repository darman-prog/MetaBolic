from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
]

profile_urlpatterns = [
    path('', views.ProfileDetailView.as_view(), name='profile'),
]

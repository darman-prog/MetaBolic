from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ProtocolViewSet, basename='protocol')
urlpatterns = router.urls

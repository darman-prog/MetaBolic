from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.TrainingSessionViewSet, basename='session')
urlpatterns = router.urls

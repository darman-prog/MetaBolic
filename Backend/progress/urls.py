from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ProgressEntryViewSet, basename='progress')
urlpatterns = router.urls

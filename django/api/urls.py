from django.urls import path
from .views import GatewayView

urlpatterns = [
    path("gateway/", GatewayView.as_view()),
]

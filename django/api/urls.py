from django.urls import path
from .views import invert

urlpatterns = [
    path("invert/", invert),
]

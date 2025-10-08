from django.urls import path
from .views import invert, add_numbers

urlpatterns = [
    path("invert/", invert),
    path("sum/", add_numbers),
]

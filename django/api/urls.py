from django.urls import path
from .views import fibonacci_many, fibonacci_single

urlpatterns = [
    path("fib/", fibonacci_single),
    path("fib-lote/", fibonacci_many),
]

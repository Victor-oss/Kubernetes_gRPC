import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "api",
    'corsheaders',
]

MIDDLEWARE = [
    "django.middleware.common.CommonMiddleware",
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = "pgateway.urls"

TEMPLATES = []

WSGI_APPLICATION = "pgateway.wsgi.application"

# No DB required for this minimal example
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}

STATIC_URL = "/static/"

CORS_ALLOW_ALL_ORIGINS = True

# Configurações do Django Rest Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'UNAUTHENTICATED_USER': None,
}
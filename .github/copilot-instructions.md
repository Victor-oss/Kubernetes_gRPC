# AI Coding Agent Guide

This repo implements an image-processing microservice architecture using gRPC streaming, Django gateway, React frontend, and Kubernetes (Minikube).

## Big Picture
- Frontend (`frontend/`): Uploads images via `multipart/form-data` to Django.
- Gateway (`django/`): Streams upload bytes to Python over gRPC (64KB chunks) and returns processed JPEG.
- Worker (`python_image/`): Reconstructs image in-memory, applies OpenCV transforms, replies once.
- Kubernetes (`kubernetes/`): Deploys `django-service` (NodePort: 30080) and `python-service` (ClusterIP: 50052).
- gRPC contract: `protos/image.proto` with `ImageService.ProcessImage(stream ImageUploadRequest) -> ImageResponse`.

## Key Files & Flows
- Frontend API call: `frontend/src/App.js` → POST `http://<MINIKUBE_IP>:30080/api/gateway/`.
- Django entrypoints:
  - URLs: `django/pgateway/urls.py` → `api/` → `django/api/urls.py` → `gateway/`.
  - View: `django/api/views.py` uses `MultiPartParser`, generator `generate_chunks()` (64KB), gRPC channel `python-service:50052`.
  - gRPC stubs: `django/grpc_utils/image_pb2*.py` (import with `from grpc_utils import ...`).
- Python server: `python_image/server.py` (OpenCV ops: grayscale, blur, etc.; `server.wait_for_termination()`).
- Dockerfiles: `django/Dockerfile` (gunicorn 8000), `python_image/Dockerfile` (python:3.9-slim + libgl1).
- Kubernetes: `kubernetes/django-deployment.yaml`, `kubernetes/django-service.yaml`, `kubernetes/python-deployment.yaml`.

## Conventions & Patterns
- gRPC client-side streaming with explicit first message for metadata, then `bytes` chunks.
- Chunk size constant: `CHUNK_SIZE = 64 * 1024` in `django/api/views.py`.
- Image response is a single JPEG blob; content-type `image/jpeg` returned by Django.
- CORS: enabled globally (`CORS_ALLOW_ALL_ORIGINS=True`), DRF auth disabled (`REST_FRAMEWORK` in `settings.py`).
- Internal service name for Python: `python-service:50052` (ClusterIP-only).
- Frontend runs locally; use `minikube ip` to target Django NodePort.

### Proto Canonical Source
- Single source of truth: `protos/image.proto` (do not duplicate under service folders).
- Regenerate stubs from it:
  - Django (in `django/`): `python -m grpc_tools.protoc -I ../protos --python_out=./grpc_utils --grpc_python_out=./grpc_utils ../protos/image.proto`
  - Python (in `python_image/`): `python -m grpc_tools.protoc -I ../protos --python_out=./grpc_utils --grpc_python_out=./grpc_utils ../protos/image.proto`

## Build & Run (Developer Workflow)
- Minikube: `minikube start`.
- Build images:
  - `docker build -t django-app:latest ./django`
  - `docker build -t python-image-service:latest ./python_image`
- Load images to Minikube: `minikube image load django-app:latest && minikube image load python-image-service:latest`.
- Apply manifests: `kubectl apply -f kubernetes/django-*.yaml && kubectl apply -f kubernetes/python-deployment.yaml`.
- Frontend (local): `cd frontend && npm install && npm start`; POSTs to `http://<MINIKUBE_IP>:30080/api/gateway/`.

## Debugging Tips
- Pods: `kubectl get pods`; logs: `kubectl logs -l app=django` and `kubectl logs -l app=python-image-processor`.
- CrashLoop due to gRPC server: ensure `wait_for_termination()` in Python.
- Image not found in Minikube: `minikube image load <image>` then delete pod to pull new image.
- gRPC import errors in Django: use absolute `from grpc_utils import image_pb2, image_pb2_grpc` and relative import in `django/grpc_utils/image_pb2_grpc.py`.
- CORS errors: confirmed configured in `django/pgateway/settings.py`.

## Extension Points
- Add new OpenCV ops in `python_image/server.py` by extending `operation` handling.
- Adjust chunk size and file types in `django/api/views.py` and `ImageMetadata`.
- If deploying outside Minikube, change service types/ingress accordingly.

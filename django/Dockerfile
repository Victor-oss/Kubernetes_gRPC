FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Stubs are committed in django/grpc_utils; to regenerate, use protos/image.proto
# Example (run manually during development, not in image build):
# python -m grpc_tools.protoc -I ../protos --python_out=./grpc_utils --grpc_python_out=./grpc_utils ../protos/image.proto

EXPOSE 8000

CMD ["gunicorn", "pgateway.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]

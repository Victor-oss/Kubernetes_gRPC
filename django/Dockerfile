FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. ../grpc/service.proto || true

EXPOSE 8000

CMD ["gunicorn", "pgateway.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]

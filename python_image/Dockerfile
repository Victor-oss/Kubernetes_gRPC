# Usa uma imagem Python leve
FROM python:3.9-slim

WORKDIR /app

# Instala dependências do sistema
# CORREÇÃO: Trocamos 'libgl1-mesa-glx' por 'libgl1'
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copia os arquivos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Stubs are committed in python_image/grpc_utils; to regenerate, use protos/image.proto
# Example (run manually during development, not in image build):
# python -m grpc_tools.protoc -I ../protos --python_out=./grpc_utils --grpc_python_out=./grpc_utils ../protos/image.proto

EXPOSE 50052

CMD ["python", "server.py"]
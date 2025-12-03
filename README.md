# Link do Vídeo Elaborado pela Equipe

[Link Youtube](https://www.youtube.com/watch?v=oCK-Ol50Rj8)

# 🚀 Processador de Imagens com gRPC Streaming, Django e Kubernetes

Esta aplicação demonstra uma arquitetura de microserviços para processamento de imagens utilizando **gRPC Streaming**, **Django REST Framework**, **Python/OpenCV** e **Kubernetes**.

## 🎯 Arquitetura

```
Frontend (React)
	↓ HTTP POST (multipart/form-data)
Django Gateway API (REST)
	↓ gRPC Client-side Streaming (chunks de 64KB)
Python Worker (OpenCV)
	↓ Processamento (grayscale, blur, edge, resize)
	↓ Retorno da imagem processada
Frontend ← Exibe resultado
```

### Componentes:

- **Frontend (React)**: Interface web para upload e visualização de imagens
- **Django Gateway**: API REST que recebe uploads e faz streaming via gRPC
- **Python Image Processor**: Serviço gRPC que processa imagens com OpenCV
- **Kubernetes**: Orquestração dos serviços backend

---

## 📦 Pré-requisitos

Antes de começar, é necessário instalar as seguintes ferramentas:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/)  
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (para o frontend React)

---

## ▶️ Passos para rodar a aplicação

### 1. Iniciar o Minikube

```shell
minikube start
```

### 2. Construir as imagens Docker

```shell
docker build -t django-app:latest ./django
docker build -t python-image-service:latest ./python_image
```

### 3. Carregar as imagens no Minikube

```shell
minikube image load django-app:latest
minikube image load python-image-service:latest
```

### 4. Aplicar os deployments do Kubernetes

```shell
kubectl apply -f kubernetes/django-deployment.yaml
kubectl apply -f kubernetes/django-service.yaml
kubectl apply -f kubernetes/python-deployment.yaml
```

### 5. Verificar se os pods estão rodando

```shell
kubectl get pods
```

Aguarde até que todos os pods estejam com status `Running`.

### 6. Obter o IP do Minikube

```shell
minikube ip
```

A API Django estará acessível em `http://<MINIKUBE_IP>:30080`

### 7. Rodar o frontend (local)

Em um terminal separado:

```shell
cd frontend
npm install
npm start
```

O frontend abrirá automaticamente em:

```
http://localhost:3000
```

### 8. Testar a aplicação

1. Acesse `http://localhost:3000` no navegador
2. Selecione uma imagem
3. Escolha um filtro (Escala de Cinza, Desfoque, Bordas, ou Reduzir Tamanho)
4. Clique em "Enviar e Processar"
5. A imagem processada será exibida abaixo

---

## 🔍 Verificar logs

```shell
# Logs do Django
kubectl logs -l app=django --tail=50

# Logs do Python
kubectl logs -l app=python-image-processor --tail=50
```

---

### 🛑 Como parar e remover a aplicação

1. Deletar os recursos do Kubernetes

```shell
kubectl delete -f kubernetes/django-deployment.yaml 
kubectl delete -f kubernetes/django-service.yaml
kubectl delete -f kubernetes/python-deployment.yaml
```

2. Parar o Minikube

```shell
minikube stop
```

3. Deletar o cluster do Minikube

```shell
minikube delete

---

## 📚 Tecnologias Utilizadas

- **Frontend**: React 19, JavaScript
- **Backend Gateway**: Django 4.2, Django REST Framework, django-cors-headers
- **Image Processor**: Python 3.9, gRPC, OpenCV, NumPy
- **Protocolo**: gRPC com Client-side Streaming
- **Containerização**: Docker
- **Orquestração**: Kubernetes (Minikube)

---

## 📝 Notas Técnicas

- **Streaming gRPC**: O upload é feito em chunks de 64KB para otimizar memória
- **CORS**: Configurado para aceitar requisições do frontend local
- **NodePort**: Django exposto na porta 30080 do Minikube
- **ClusterIP**: Python acessível apenas internamente como `python-service:50052`

```
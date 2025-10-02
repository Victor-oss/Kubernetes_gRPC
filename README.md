# 🚀 Guia para rodar a aplicação com Minikube e Kubernetes

Este guia descreve como configurar e executar a aplicação utilizando **Minikube** e **Kubernetes**.

---

## 📦 Pré-requisitos

Antes de começar, é necessário instalar as seguintes ferramentas:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/)  
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

Além disso, você deve ter o **Docker** instalado em sua máquina, já que as imagens da aplicação serão construídas localmente.

---

## ▶️ Passos para rodar a aplicação

### 1. Iniciar o Minikube

```shell
minikube start
```
### 2. Configurar o ambiente Docker do Minikube

```shell
eval $(minikube docker-env)
```

Obs.: Caso você receba um erro do tipo "Unable to resolve the current Docker CLI...", dê o comando acima novamente até não retornar nenhuma mensagem de erro

### 3. Construir as imagens Docker

```shell
docker build -t django-app:latest ./django
docker build -t react-frontend:latest ./frontend
docker build -t nodejs-node-server:latest ./nodejs
```

### 4. Carregar as imagens no Minikube
```shell
minikube image load django-app:latest
minikube image load react-frontend:latest
minikube image load nodejs-node-server:latest
```

### 5. Aplicar os manifests do Kubernetes

```shell
kubectl apply -f kubernetes/django-deployment.yaml
kubectl apply -f kubernetes/django-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
kubectl apply -f kubernetes/nodejs-deployment.yaml
kubectl apply -f kubernetes/nodejs-service.yaml
```

6. Obter o IP do Minikube

```shell
minikube ip
```

O frontend estará disponível neste IP.

```
http://<minikube-ip>:30081
```

### 🛑 Como parar e remover a aplicação

1. Deletar os recursos do Kubernetes

```shell
kubectl delete -f kubernetes/django-deployment.yaml 
kubectl delete -f kubernetes/django-service.yaml
kubectl delete -f kubernetes/frontend-deployment.yaml 
kubectl delete -f kubernetes/frontend-service.yaml
kubectl delete -f kubernetes/nodejs-deployment.yaml
kubectl delete -f kubernetes/nodejs-service.yaml
```

2. Parar o Minikube

```shell
minikube stop
```

3. Deletar o cluster do Minikube

```shell
minikube delete
```
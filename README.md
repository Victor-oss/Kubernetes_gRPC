# Link do Vídeo Elaborado pela Equipe

[Link Youtube](https://www.youtube.com/watch?v=oCK-Ol50Rj8)

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

Obs.: Caso você receba um erro do tipo "Unable to resolve the current Docker CLI...", dê o comando acima novamente até não retornar nenhuma mensagem de erro. Caso não funcione, publique as imagens no docker hub

### 3. Construir as imagens Docker

```shell
docker build -t django-app:latest ./django
docker build -t nodejs-node-server:latest ./nodejs
docker build -t java-server:latest ./java
```

### 4. Carregar as imagens no Minikube
```shell
minikube image load django-app:latest
minikube image load nodejs-node-server:latest
minikube image load java-server:latest
```

### 5. Aplicar os manifests do Kubernetes

```shell
kubectl apply -f kubernetes/django-deployment.yaml
kubectl apply -f kubernetes/django-service.yaml
kubectl apply -f kubernetes/nodejs-deployment.yaml
kubectl apply -f kubernetes/nodejs-service.yaml
kubectl apply -f kubernetes/java-deployment.yaml
kubectl apply -f kubernetes/java-service.yaml
```
6. Deixar porta da api acessível à sua máquina local

```shell
kubectl port-forward service/django-service 8000:8000
```

7. Rodar o frontend

Em um terminal separado, no diretório raiz do projeto rode os comandos abaixo

```shell
cd frontend
npm install
npm start
```

Acesse a URL abaixo no browser para acessar a aplicação:

```
http://localhost:8000
```

### 🛑 Como parar e remover a aplicação

1. Deletar os recursos do Kubernetes

```shell
kubectl delete -f kubernetes/django-deployment.yaml 
kubectl delete -f kubernetes/django-service.yaml
kubectl delete -f kubernetes/nodejs-deployment.yaml
kubectl delete -f kubernetes/nodejs-service.yaml
kubectl delete -f kubernetes/java-deployment.yaml
kubectl delete -f kubernetes/java-service.yaml
```

2. Parar o Minikube

```shell
minikube stop
```

3. Deletar o cluster do Minikube

```shell
minikube delete
```
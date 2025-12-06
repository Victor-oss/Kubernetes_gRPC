# Link do Vídeo Elaborado pela Equipe

[Link Youtube](https://www.youtube.com/watch?v=oCK-Ol50Rj8)

# 🚀 Guia para rodar a aplicação com Minikube e Kubernetes

Este guia descreve como configurar e executar a aplicação utilizando **Minikube** e **Kubernetes**.

---

## 📦 Pré-requisitos

Antes de começar, é necessário instalar as seguintes ferramentas:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/)  
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/)

Além disso, você deve ter o **Docker** instalado em sua máquina, já que as imagens da aplicação serão construídas localmente.

---

## ▶️ Passos para rodar a aplicação

### 1. Iniciar o Minikube

```shell
minikube start \
  --extra-config=kubelet.authentication-token-webhook=true \
  --extra-config=kubelet.authorization-mode=Webhook
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

Depois de instalar o Helm, é preciso dar os seguintes comandos para instalar programas importantes como o Prometheus, que permite monitorar o cluster

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

```
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false
```

```shell
kubectl apply -f kubernetes/django-config.yaml
kubectl apply -f kubernetes/django-deployment.yaml
kubectl apply -f kubernetes/django-service.yaml
kubectl apply -f kubernetes/django-hpa.yaml
kubectl apply -f kubernetes/nodejs-config.yaml
kubectl apply -f kubernetes/nodejs-pvc.yaml
kubectl apply -f kubernetes/nodejs-deployment.yaml
kubectl apply -f kubernetes/nodejs-service.yaml
kubectl apply -f kubernetes/nodejs-hpa.yaml
kubectl apply -f kubernetes/nodejs-pdb.yaml
kubectl apply -f kubernetes/java-deployment.yaml
kubectl apply -f kubernetes/java-service.yaml
kubectl apply -f kubernetes/java-hpa.yaml
kubectl apply -f kubernetes/django-monitor.yaml
kubectl apply -f kubernetes/java-monitor.yml
kubectl apply -f kubernetes/nodejs-monitor.yaml
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
http://localhost:3000
```

### Monitoramento do Cluster

Consiga a senha do usuário admin através do comando abaixo

```
kubectl get secret --namespace monitoring -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo
```

Para conseguir ver a interface web com os dados do Prometheus é preciso entrar no Grafana. Para isso é necessário dar o comando abaixo:

```
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
```

Acesse o endereço http://localhost:3001 e depois faça login com o usuário admin e a senha obtida

### 🛑 Como parar e remover a aplicação

1. Deletar os recursos do Kubernetes

```shell
kubectl delete -f kubernetes/django-deployment.yaml 
kubectl delete -f kubernetes/django-service.yaml
kubectl delete -f kubernetes/nodejs-deployment.yaml
kubectl delete -f kubernetes/nodejs-service.yaml
kubectl delete -f kubernetes/java-deployment.yaml
kubectl delete -f kubernetes/java-service.yaml
kubectl delete -f kubernetes/django-monitor.yaml
kubectl delete -f kubernetes/java-monitor.yml
kubectl delete -f kubernetes/nodejs-monitor.yaml
```

2. Parar o Minikube

```shell
minikube stop
```

3. Deletar o cluster do Minikube

```shell
minikube delete
```
Comandos para rodar a aplicação 

minikube start
docker build -t django-app:latest .
minikube image load django-app:latest
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
minikube service django-service --url
kubectl delete -f kubernetes/deployment.yaml
kubectl delete -f kubernetes/service.yaml
minikube stop
minikube delete
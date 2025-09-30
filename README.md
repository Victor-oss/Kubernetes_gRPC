Comandos para rodar a aplicação 

minikube start
eval $(minikube docker-env)
docker build -t django-app:latest ./django
docker build -t react-frontend:latest ./frontend
minikube image load django-app:latest
minikube image load react-frontend:latest
kubectl apply -f kubernetes/django-deployment.yaml
kubectl apply -f kubernetes/django-service.yaml 
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
minikube ip
kubectl delete -f kubernetes/django-deployment.yaml 
kubectl delete -f kubernetes/django-service.yaml
kubectl delete -f kubernetes/frontend-deployment.yaml 
kubectl delete -f kubernetes/frontend-service.yaml
minikube stop
minikube delete
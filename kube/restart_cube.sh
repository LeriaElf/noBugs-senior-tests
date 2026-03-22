#!/bin/bash

minikube start --driver=docker

helm install nbank ./kube/nbank-chart

kubectl get svc 

kubectl get pods 

kubectl logs deployment/backend
kubectl logs deployment/frontend
kubectl logs deployment/nginx

kubectl port-forward svc/nginx 3000:80 &
kubectl port-forward svc/backend 4111:4111 &

# kubectl scale deployment/backend --replicas=2
# kubectl scale deployment/frontend --replicas=2
# kubectl get pods

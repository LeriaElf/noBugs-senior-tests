#!/bin/bash

minikube start --driver=docker

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add elastic https://helm.elastic.co || true
helm repo update

helm upgrade --install nbank ./kube/nbank-chart

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace -f ./kube/monitoring-values.yaml

kubectl create secret generic backend-basic-auth --from-literal=username=admin --from-literal=password=admin -n monitoring || true

kubectl apply -f ./kube/spring-monitoring.yaml

# Ждём пока поды будут готовы
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
kubectl rollout status deployment/nginx

kubectl get svc
kubectl get pods

kubectl logs deployment/backend
kubectl logs deployment/frontend
kubectl logs deployment/nginx

# Пробрасываем порты после готовности подов
kubectl port-forward svc/nginx 3000:80 &
kubectl port-forward svc/backend 4111:4111 &
kubectl port-forward svc/monitoring-kube-prometheus-prometheus -n monitoring 3001:9090 &
kubectl port-forward svc/monitoring-grafana -n monitoring 3002:80 &

# kubectl scale deployment/backend --replicas=2
# kubectl scale deployment/frontend --replicas=2
# kubectl get pods

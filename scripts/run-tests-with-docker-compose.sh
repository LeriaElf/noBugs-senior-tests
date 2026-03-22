#!/bin/bash

IMAGE_NAME=lchiffa/nobugs-tests:latest
TIMESTAMP=$(date +"%Y%m%d_%H%M")
TEST_OUTPUT_DIR=./test-output/$TIMESTAMP

# Остановить окружение при выходе — даже если тесты упали
trap 'echo ">>> Остановка окружения"; docker compose down' EXIT

echo ">>> Скачивание образа с тестами"
docker pull $IMAGE_NAME

echo ">>> Поднятие тестового окружения"
docker compose up -d

mkdir -p "$TEST_OUTPUT_DIR/logs"
mkdir -p "$TEST_OUTPUT_DIR/api-report"
mkdir -p "$TEST_OUTPUT_DIR/ui-report"

echo ">>> Запуск тестов"
docker run --rm \
  --network nobugs-network \
  -v "$TEST_OUTPUT_DIR/logs":/app/logs \
  -v "$TEST_OUTPUT_DIR/api-report":/app/mochawesome-report \
  -v "$TEST_OUTPUT_DIR/ui-report":/app/playwright-report \
  -e CI=true \
  -e BASE_URL=http://backend:4111/api/v1 \
  -e UI_BASE_URL=http://nginx \
  $IMAGE_NAME

echo ""
echo ">>> Тесты завершены"
echo "Лог:         $TEST_OUTPUT_DIR/logs/run.log"
echo "API-отчет:   $TEST_OUTPUT_DIR/api-report/api-report.html"
echo "UI-отчет:    $TEST_OUTPUT_DIR/ui-report/index.html"

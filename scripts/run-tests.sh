#!/bin/bash

# Настройка
IMAGE_NAME=nobugs-tests
TEST_SUITE=${1:-all}         
TIMESTAMP=$(date +"%Y%m%d_%H%M")
TEST_OUTPUT_DIR=./test-output/$TIMESTAMP

# Адреса серверов
APIBASEURL=http://host.docker.internal:4111/api/v1
UIBASEURL=http://host.docker.internal:3000
ADMIN_TOKEN="Basic YWRtaW46YWRtaW4="

echo ">>> Сборка тестов запущена"
docker build -t $IMAGE_NAME .

mkdir -p "$TEST_OUTPUT_DIR/logs"
mkdir -p "$TEST_OUTPUT_DIR/api-report"
mkdir -p "$TEST_OUTPUT_DIR/ui-report"

# Запуск контейнера
echo ">>> Запуск тестов (TEST_SUITE=$TEST_SUITE)..."
docker run --rm \
  -v "$TEST_OUTPUT_DIR/logs":/app/logs \
  -v "$TEST_OUTPUT_DIR/api-report":/app/mochawesome-report \
  -v "$TEST_OUTPUT_DIR/ui-report":/app/playwright-report \
  -e TEST_SUITE="$TEST_SUITE" \
  -e BASE_URL="$APIBASEURL" \
  -e UI_BASE_URL="$UIBASEURL" \
  -e ADMIN_TOKEN="$ADMIN_TOKEN" \
  -e CI=true \
  $IMAGE_NAME

# Вывод итогов
echo ""
echo ">>> Тесты завершены"
echo "Лог:         $TEST_OUTPUT_DIR/logs/run.log"
echo "API-отчет:   $TEST_OUTPUT_DIR/api-report/api-report.html"
echo "UI-отчет:    $TEST_OUTPUT_DIR/ui-report/index.html"

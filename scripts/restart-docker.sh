#!/bin/bash

echo ">>> Остановить Docker Compose"
docker compose down

echo ">>> Запуск Docker Compose (с пересборкой playwright)"
docker compose up --build

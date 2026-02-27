#!/bin/bash
set -e

if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

DOCKER_USERNAME="lchiffa"
LOCAL_IMAGE_NAME="nobugs-tests"
LOCAL_IMAGE_TAG="latest"
REMOTE_IMAGE_NAME="nobugs-tests"
REMOTE_IMAGE_TAG="latest"

if [ -z "${DOCKERHUB_TOKEN}" ]; then
  echo "Ошибка: переменная окружения DOCKERHUB_TOKEN не задана"
  exit 1
fi

echo ">>> Авторизация в Docker Hub..."
echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKER_USERNAME}" --password-stdin

echo ">>> Тегирование образа..."
docker tag "${LOCAL_IMAGE_NAME}:${LOCAL_IMAGE_TAG}" "${DOCKER_USERNAME}/${REMOTE_IMAGE_NAME}:${REMOTE_IMAGE_TAG}"

echo ">>> Публикация образа..."
docker push "${DOCKER_USERNAME}/${REMOTE_IMAGE_NAME}:${REMOTE_IMAGE_TAG}"

echo ""
echo ">>> Готово! Чтобы скачать образ, выполните:"
echo "  docker pull ${DOCKER_USERNAME}/${REMOTE_IMAGE_NAME}:${REMOTE_IMAGE_TAG}"

FROM mcr.microsoft.com/playwright:v1.58.1-noble

ARG TEST_SUITE=all
ARG BASE_URL=http://host.docker.internal:4111/api/v1
ARG UI_BASE_URL=http://host.docker.internal:3000
ARG ADMIN_TOKEN=Basic YWRtaW46YWRtaW4=
ARG ADMIN_USERNAME=admin
ARG ADMIN_PASSWORD=admin

ENV TEST_SUITE=${TEST_SUITE}
ENV BASE_URL=${BASE_URL}
ENV UI_BASE_URL=${UI_BASE_URL}
ENV ADMIN_TOKEN=${ADMIN_TOKEN}
ENV ADMIN_USERNAME=${ADMIN_USERNAME}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

USER root

CMD /bin/bash -c " \
    mkdir -p /app/logs ; \
    { \
    if [ \"$TEST_SUITE\" = \"api\" ] || [ \"$TEST_SUITE\" = \"all\" ] ; then \
        echo '>>> Running API tests' ; \
        npm run test:api ; \
    fi ; \
    if [ \"$TEST_SUITE\" = \"ui\" ] || [ \"$TEST_SUITE\" = \"all\" ] ; then \
        echo '>>> Running UI tests' ; \
        npx playwright test ; \
    fi ; \
    } 2>&1 | tee /app/logs/run.log"

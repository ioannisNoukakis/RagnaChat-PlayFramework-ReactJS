#!/bin/bash

mkdir /home/ubuntu/monitoring
touch /home/ubuntu/monitoring/hello.txt

if ! [[ $(which docker) && $(docker --version) ]]; then
    echo "Installing docker..."
    apt update &&
    apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        software-properties-common &&
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - &&
    add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) \
        stable" &&
    apt update &&
    apt-get install docker-ce -y &&
    curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose &&
    chmod +x /usr/local/bin/docker-compose &&
    usermod -aG docker ubuntu &&
    . ~/.profile

fi

echo AWS_ACCESS_KEY_ID=${aws_access_key_id} >> /home/ubuntu/monitoring/.env && \
echo AWS_SECRET_ACCESS_KEY=${aws_secret_access_key} >> /home/ubuntu/monitoring/.env && \
echo AWS_DEFAULT_REGION=${aws_default_region} >> /home/ubuntu/monitoring/.env && \
echo CLUSTER_NAME=${cluster_name} >> /home/ubuntu/monitoring/.env && \
echo SERVICE_NAME=${service_name} >> /home/ubuntu/monitoring/.env && \
echo TASK_PROMETHEUS_PORT=${prometheus_task_port} >> /home/ubuntu/monitoring/.env && \
echo TASK_PROMETHEUS_PATH=${prometheus_task_path} >> /home/ubuntu/monitoring/.env && \
echo TARGET_LABEL_DEPLOYMENT_MODE=${prometheus_label_deployment_mode} >> /home/ubuntu/monitoring/.env && \
echo TARGET_LABEL_JOB_NAME=${target_label_job_name} >> /home/ubuntu/monitoring/.env && \
echo TARGET_FILE_DIRECTORY=${target_file_directory} >> /home/ubuntu/monitoring/.env && \
echo REFRESH_INTERVAL=${refresh_interval} >> /home/ubuntu/monitoring/.env

echo "version: '3.7'                                                                             " >> /home/ubuntu/monitoring/docker-compose.yml
echo "                                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "                                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "services:                                                                                  " >> /home/ubuntu/monitoring/docker-compose.yml
echo "  ecs_targets_finder:                                                                      " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    image: gitlab-registry.ebu.io/eurovox/ecs-monitoring:latest                            " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    restart: always                                                                        " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    environment:                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      AWS_ACCESS_KEY_ID: \$${AWS_ACCESS_KEY_ID}                                            " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      AWS_SECRET_ACCESS_KEY: \$${AWS_SECRET_ACCESS_KEY}                                    " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      AWS_DEFAULT_REGION: \$${AWS_DEFAULT_REGION}                                          " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      CLUSTER_NAME: \$${CLUSTER_NAME}                                                      " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      SERVICE_NAME: \$${SERVICE_NAME}                                                      " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      TASK_PROMETHEUS_PORT: \$${TASK_PROMETHEUS_PORT}                                      " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      TASK_PROMETHEUS_PATH: \$${TASK_PROMETHEUS_PATH}                                      " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      TARGET_LABEL_DEPLOYMENT_MODE: \$${TARGET_LABEL_DEPLOYMENT_MODE}                      " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      TARGET_LABEL_JOB_NAME: \$${TARGET_LABEL_JOB_NAME}                                    " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      REFRESH_INTERVAL: \$${REFRESH_INTERVAL}                                              " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      TARGET_FILE_DIRECTORY: sd_targets                                                    " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    volumes:                                                                               " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - sd_volumes:/opt/app/sd_targets                                                     " >> /home/ubuntu/monitoring/docker-compose.yml
echo "                                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "  prometheus:                                                                              " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    image: prom/prometheus                                                                 " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    restart: always                                                                        " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    command: --storage.tsdb.retention.time=60d --config.file=/etc/prometheus/prometheus.yml" >> /home/ubuntu/monitoring/docker-compose.yml
echo "    ports:                                                                                 " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - 9090:9090                                                                          " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    volumes:                                                                               " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - ./prometheus.yml:/etc/prometheus/prometheus.yml                                    " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - sd_volumes:/opt/app/sd_targets                                                     " >> /home/ubuntu/monitoring/docker-compose.yml
echo "                                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "                                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "  grafana:                                                                                 " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    image: grafana/grafana                                                                 " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    restart: always                                                                        " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    environment:                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - GF_INSTALL_PLUGINS=grafana-piechart-panel,digiapulssi-breadcrumb-panel,jdbranham-diagram-panel,natel-plotly-panel " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - GF_SERVER_ROOT_URL=https://grafana-staging.ragnachat.io:3000                        " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    ports:                                                                                 " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - 3000:3000                                                                          " >> /home/ubuntu/monitoring/docker-compose.yml
echo "    volumes:                                                                               " >> /home/ubuntu/monitoring/docker-compose.yml
echo "      - grafana:/var/lib/grafana                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "                                                                                           " >> /home/ubuntu/monitoring/docker-compose.yml
echo "volumes:                                                                                   " >> /home/ubuntu/monitoring/docker-compose.yml
echo "  sd_volumes:                                                                              " >> /home/ubuntu/monitoring/docker-compose.yml
echo "  grafana:                                                                                 " >> /home/ubuntu/monitoring/docker-compose.yml

echo "global:                                        " >> /home/ubuntu/monitoring/prometheus.yml
echo "  scrape_interval: 15s                         " >> /home/ubuntu/monitoring/prometheus.yml
echo "                                               " >> /home/ubuntu/monitoring/prometheus.yml
echo "scrape_configs:                                " >> /home/ubuntu/monitoring/prometheus.yml
echo "                                               " >> /home/ubuntu/monitoring/prometheus.yml
echo "  - job_name: 'prometheus'                     " >> /home/ubuntu/monitoring/prometheus.yml
echo "    static_configs:                            " >> /home/ubuntu/monitoring/prometheus.yml
echo "      - targets: ['localhost:9090']            " >> /home/ubuntu/monitoring/prometheus.yml
echo "                                               " >> /home/ubuntu/monitoring/prometheus.yml
echo "  - job_name: 'backend'                        " >> /home/ubuntu/monitoring/prometheus.yml
echo "    file_sd_configs:                           " >> /home/ubuntu/monitoring/prometheus.yml
echo "      - files:                                 " >> /home/ubuntu/monitoring/prometheus.yml
echo "          - '/opt/app/sd_targets/targets.json' " >> /home/ubuntu/monitoring/prometheus.yml

cd /home/ubuntu/monitoring && docker login -u noukakis -p${gitlab_password} https://gitlab-registry.ebu.io && docker-compose up -d

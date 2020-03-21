[
  {
    "name": "backend",
    "image": "ioannisnoukakis9390/ragnachatserver:latest",
    "resourceRequirements": null,
    "essential": true,
    "portMappings": [
      {
        "hostPort": 9000,
        "containerPort": 9000,
        "protocol": "tcp"
      }
    ],
    "environment": [
      {
        "name": "CORS_ALLOWED_HOSTS.0",
        "value": "https://staging.ragnachat.io"
      },
      {
        "name": "APP_VERSION",
        "value": "staging-no-commit-yet"
      }
    ],
    "secrets": [
      {
        "name": "MONGODB_URL",
        "valueFrom": "${mongodb_url_secret_arn}"
      },
      {
        "name": "JWT_SECRET",
        "valueFrom": "${jwt_secret_secret_arn}"
      },
      {
        "name": "GOOGLE_CLIENT_ID",
        "valueFrom": "${google_client_id_secret_arn}"
      }
    ],
    "mountPoints": null,
    "volumesFrom": null,
    "hostname": null,
    "user": null,
    "workingDirectory": null,
    "extraHosts": null,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/fargate/ragnachat-backend",
        "awslogs-region": "${aws_region}",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "ulimits": null,
    "dockerLabels": null,
    "dependsOn": null,
    "repositoryCredentials": {
      "credentialsParameter": "${credentials_parameter_secret_arn}"
    }
  }
]

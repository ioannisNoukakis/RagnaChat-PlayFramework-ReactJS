resource "aws_ecs_cluster" "main" {
  name    = "ragnachat-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ======================================================================================================================
# TASKS
# ======================================================================================================================
data "template_file" "ragnachatBackendTaskTemplate" {
  template      = file("./task-definitions/backend-service.json.tpl")

  vars = {
    aws_region                       = var.aws_region
    mongodb_url_secret_arn           = var.mongodb_url_secret_arn
    jwt_secret_secret_arn            = var.jwt_secret_secret_arn
    google_client_id_secret_arn      = var.google_client_id_secret_arn
    credentials_parameter_secret_arn = var.credentials_parameter_secret_arn
  }
}

resource "aws_ecs_task_definition" "ragnachatBackendTask" {
  family                   = "ragnachat-backend"
  container_definitions    = data.template_file.ragnachatBackendTaskTemplate.rendered
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html
  cpu                      = 256
  memory                   = 512

  execution_role_arn       = aws_iam_role.ecs-run-task.arn
}

# ======================================================================================================================
# SERVICES
# ======================================================================================================================
resource "aws_ecs_service" "ragnachatBackendService" {
  name            = "ragnachat-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ragnachatBackendTask.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private.*.id
    # FIXME really need PUBLIC IP?
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.backend.id
    container_name   = "backend"
    container_port   = 9000
  }

  depends_on = [aws_alb_listener.staging-https]
}

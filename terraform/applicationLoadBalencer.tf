resource "aws_alb" "main" {
  name = "ragnachat-load-balancer"
  subnets = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
}
resource "aws_alb_listener" "staging-http" {
  load_balancer_arn = aws_alb.main.id
  port = 80
  protocol = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port = "443"
      protocol = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_alb_listener" "staging-https" {
  load_balancer_arn = aws_alb.main.id
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.backend.id
  }
}

resource "aws_lb_listener_rule" "staging-grafana" {
  listener_arn = aws_alb_listener.staging-https.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.staging-grafana.id
  }

  condition {
    host_header {
      values = ["grafana-staging.ragnachat.io"]
    }
  }
}

resource "aws_alb_target_group" "backend" {
  name = "ragnachat-backend-target-group"
  port = 9000
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold = "3"
    interval = "30"
    protocol = "HTTP"
    matcher = "200"
    timeout = "3"
    path = "/"
    unhealthy_threshold = "2"
  }
}

resource "aws_alb_target_group" "staging-grafana" {
  name = "ragnachat-grafana-target-group"
  port = 3000
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold = "3"
    interval = "30"
    protocol = "HTTP"
    matcher = "200"
    timeout = "3"
    path = "/"
    unhealthy_threshold = "2"
  }
}

resource "aws_alb_target_group_attachment" "staging-grafana" {
  target_group_arn = aws_alb_target_group.staging-grafana.arn
  target_id        = aws_instance.monitoring-ragnachat-staging.private_ip
  port             = 3000
}


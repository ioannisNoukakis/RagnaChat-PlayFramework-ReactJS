output "alb_hostname" {
  value = aws_alb.main.dns_name
}

output "ecs_monitoring_ip" {
  value = [aws_instance.monitoring-ragnachat-staging.public_ip, aws_instance.monitoring-ragnachat-staging.private_ip]
}

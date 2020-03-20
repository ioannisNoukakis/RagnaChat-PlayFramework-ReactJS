# Set up CloudWatch group and log stream and retain logs for 30 days
resource "aws_cloudwatch_log_group" "ragnachat_log_group_backend" {
  name              = "/fargate/ragnachat-backend"
  retention_in_days = 30

  tags = {
    Name = "ragnachat-log-group"
  }

}

resource "aws_cloudwatch_log_stream" "ragnachat_log_stream_backend" {
  name           = "ragnachat-log-stream-backend"
  log_group_name = aws_cloudwatch_log_group.ragnachat_log_group_backend.name
}

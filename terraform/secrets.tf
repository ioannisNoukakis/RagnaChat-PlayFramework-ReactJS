data "aws_secretsmanager_secret" "ragnachat-aws-access-key" {
  name = "ragnachat-aws-access-key"
}

data "aws_secretsmanager_secret_version" "ragnachat-aws-access-key" {
  secret_id = data.aws_secretsmanager_secret.ragnachat-aws-access-key.id
}

data "aws_secretsmanager_secret" "ragnachat-aws-secret-access-key" {
  name = "ragnachat-aws-secret-access-key"
}

data "aws_secretsmanager_secret_version" "ragnachat-aws-secret-access-key" {
  secret_id = data.aws_secretsmanager_secret.ragnachat-aws-secret-access-key.id
}

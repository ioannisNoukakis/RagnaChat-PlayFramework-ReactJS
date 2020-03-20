# General config.
provider "aws" {
  version = "~> 2.8"
  region = var.aws_region
}

# Global lock for terraform states transactions.
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "ragnachat-global-lock"
  hash_key       = "LockID"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "terraform_lock"
  }
}

# Configuration of terraform that will store its states into S3.
terraform {
  backend "s3" {
    bucket = "ioannis-tfstates"
    key    = "raganchat"
    region = "eu-west-1"
    dynamodb_table = "ragnachat-global-lock"
  }
}

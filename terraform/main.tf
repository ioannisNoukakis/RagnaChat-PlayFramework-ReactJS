# General config.
provider "aws" {
  version = "~> 2.0"
  region  = "eu-west-1"
}

# Global lock for terraform states transactions.
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "RagnachatStates"
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
    bucket = "ragnachat-terraform"
    key    = "ragnachat-terraform-states"
    region = "eu-west-1"
    dynamodb_table = "RagnachatStates"
  }
}

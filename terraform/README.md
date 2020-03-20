# Terraform module

Welcome to the terraform module. 

## Prerequisites
- Terraform: v0.12.23+

## How to deploy

Create a file named `terraform.tfvars` and fill it with the following values:

    acm_certificate_arn=<You must register a domain and order an SSL certificate on it. Place the ARN of the said certificate here.>
    aws_bucket_name="<name of the S3 bucket>"
    aws_access_key_secret_arn="<You must create this secret in AWS secret manager as a plain text value>"
    aws_secret_access_key_secret_arn="<You must create this secret in AWS secret manager as a plain text value>"
    mongodb_connection_url_secret_arn="<You must create this secret in AWS secret manager as a plain text value>"
    auth_cookie_name="<The name of the cookie that will contain the auth for the backend and core-layer.>"
    cors_origins_allowed="<Example: http://localhost:3000,https://www.ragnachat.io>"
    
Then, if it is the first time you run terraform run
 
    terraform init
    
Then

    terraform apply

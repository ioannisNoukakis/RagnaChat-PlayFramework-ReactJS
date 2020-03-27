variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "eu-west-1"
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

variable "acm_certificate_arn" {}
variable "acm_cloudfront_certificate_arn" {}

variable "mongodb_url_secret_arn" {}
variable "jwt_secret_secret_arn" {}
variable "google_client_id_secret_arn" {}
variable "credentials_parameter_secret_arn" {}

variable "gitlab_password" {}

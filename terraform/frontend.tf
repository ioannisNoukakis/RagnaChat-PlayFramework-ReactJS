resource "aws_s3_bucket" "ragnachatfrontend" {
  bucket = "ragnachatfrontend"
  acl    = "public-read"

  policy = <<EOF
{
  "Version":"2012-10-17",
  "Statement":[{
        "Sid":"PublicReadForGetBucketObjects",
        "Effect":"Allow",
          "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::ragnachatfrontend/*"]
    }
  ]
}
EOF

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  tags = {
    Name        = "ragnachatFrontend"
    Environment = "staging"
  }
}

locals {
  s3_origin_id = "ragnachatOrigin"
}

resource "aws_cloudfront_distribution" "staging_s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.ragnachatfrontend.bucket_regional_domain_name
    origin_id   = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "ragnachat frontend"
  default_root_object = "index.html"

  aliases = ["staging.ragnachat.io"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = var.acm_cloudfront_certificate_arn
    ssl_support_method = "sni-only"
  }
}

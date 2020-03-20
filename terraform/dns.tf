data "aws_route53_zone" "ragnachatHostedZone" {
  name         = "ragnachat.io."
}

resource "aws_route53_record" "staging-api" {
  zone_id = data.aws_route53_zone.ragnachatHostedZone.zone_id
  name    = "staging-api.ragnachat.io"
  type    = "CNAME"
  ttl     = "300"
  records = [aws_alb.main.dns_name]

  depends_on = [aws_alb.main]
}

resource "aws_route53_record" "staging" {
  zone_id = data.aws_route53_zone.ragnachatHostedZone.zone_id
  name    = "staging.ragnachat.io"
  type    = "CNAME"
  ttl     = "300"
  records = [aws_alb.main.dns_name]

  depends_on = [aws_alb.main]
}


data "aws_route53_zone" "public" {
  zone_id=var.hosted_zone_id
}


resource "aws_acm_certificate" "front_cert" {
  provider = aws.acm_provider
  domain_name       = var.root_domain_name
  validation_method = "DNS"
  subject_alternative_names = [var.web_domain_name]
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate" "back_cert" {
  domain_name       = var.api_domain_name
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}


resource "aws_route53_record" "validation_front_records" {
  for_each = {
    for dvo in aws_acm_certificate.front_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.public.zone_id
}

resource "aws_route53_record" "validation_back_records" {
  for_each = {
    for dvo in aws_acm_certificate.back_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.public.zone_id
}


resource "aws_acm_certificate_validation" "front_validation" {
  provider = aws.acm_provider
  certificate_arn         = aws_acm_certificate.front_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.validation_front_records : record.fqdn]
}

resource "aws_acm_certificate_validation" "back_validation" {
  certificate_arn         = aws_acm_certificate.back_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.validation_back_records : record.fqdn]
}
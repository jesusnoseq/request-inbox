resource "aws_s3_bucket" "front_app_bucket" {
  bucket = var.web_domain_name
}


resource "aws_s3_bucket_website_configuration" "front_app_bucket_website" {
  bucket = aws_s3_bucket.front_app_bucket.bucket
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
  
  routing_rule {
    condition {
      key_prefix_equals = "inbox/"
    }
    redirect {
      replace_key_with = "index.html"
    }
  }

}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket                  = aws_s3_bucket.front_app_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


resource "aws_s3_bucket_cors_configuration" "front_app_bucket_cors" {
  bucket = aws_s3_bucket.front_app_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["https://${var.web_domain_name}", "http://${var.web_domain_name}"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}


resource "aws_s3_bucket_policy" "front_app_bucket_policy" {
  bucket = aws_s3_bucket.front_app_bucket.id
  policy = templatefile("s3-policy.json", { bucket = aws_s3_bucket.front_app_bucket.bucket })
}

locals {
  mime_types = {
    "css"  = "text/css"
    "html" = "text/html"
    "ico"  = "image/vnd.microsoft.icon"
    "js"   = "application/javascript"
    "json" = "application/json"
    "map"  = "application/json"
    "png"  = "image/png"
    "svg"  = "image/svg+xml"
    "txt"  = "text/plain"
  }
}

resource "aws_s3_object" "front_app_files" {
  for_each = fileset("../front/build/", "**/*")

  bucket = aws_s3_bucket.front_app_bucket.bucket
  key    = each.value
  source = "../front/build/${each.value}"
  etag   = filemd5("../front/build/${each.value}")
  content_type = lookup(
    tomap(local.mime_types),
    element(split(".", each.key), length(split(".", each.key)) - 1),
    "binary/octet-stream"
  )
}


resource "aws_s3_bucket" "redirect_bucket" {
  bucket =  var.root_domain_name
}

resource "aws_s3_bucket_public_access_block" "redirect_bucket_public_access" {
  bucket                  = aws_s3_bucket.redirect_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "redirect_bucket_policy" {
  bucket = aws_s3_bucket.redirect_bucket.id
  policy = templatefile("s3-policy.json", { bucket = aws_s3_bucket.redirect_bucket.bucket })
}

resource  "aws_s3_bucket_website_configuration" "redirect_bucket" {
  bucket = aws_s3_bucket.redirect_bucket.bucket
  redirect_all_requests_to {
    host_name = var.web_domain_name
    protocol = "https"
  }
}

resource "aws_cloudfront_function" "redirect_path" {
  name    = "always-serve-index"
  runtime = "cloudfront-js-2.0"
  publish = true
  # code from https://github.com/aws-samples/amazon-cloudfront-functions/blob/main/url-rewrite-single-page-apps/index.js
  code = <<-EOT
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check whether the URI is missing a file name.
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    // Check whether the URI is missing a file extension.
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
  EOT
}


resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.front_app_bucket.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.front_app_bucket.bucket
  }

  enabled             = true
  default_root_object = "index.html"
  
  retain_on_delete = true

  aliases = [var.web_domain_name, var.root_domain_name]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.front_cert.arn
    ssl_support_method  = "sni-only"
  }

  default_cache_behavior {
    target_origin_id = aws_s3_bucket.front_app_bucket.bucket

    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern     = "/index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = aws_s3_bucket.front_app_bucket.bucket

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }
}


resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.public.zone_id
  name    = var.web_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.public.zone_id
  name    = var.root_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

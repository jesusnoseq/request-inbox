resource "aws_s3_bucket_website_configuration" "react_app_bucket" {
  bucket = "request-inbox-lambda-bucket"
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
}

resource "aws_s3_object" "react_app_files" {
  for_each = fileset("../front/build/", "**/*")

  bucket = aws_s3_bucket_website_configuration.react_app_bucket.bucket
  key    = each.value
  source = "../front/build/${each.value}"
  etag   = filemd5("../front/build/${each.value}")
}

resource "aws_cloudfront_distribution" "react_app_cdn" {
  origin {
    domain_name = "request-inbox.com"
    origin_id   = "react-inbox-front-app-bucket"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.react_app_oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "react-inbox-front-app-bucket"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
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
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_identity" "react_app_oai" {
  comment = "OAI for my-react-app-bucket"
}
output "front_app_bucket_website_url" {
  value = aws_s3_bucket_website_configuration.front_app_bucket_website.website_endpoint
}

output "custom_domain_api" {
  value = "https://${aws_apigatewayv2_api_mapping.api.domain_name}"
}

output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}


data "archive_file" "lambda-package" {
  type        = "zip"
  source_file = "../bootstrap"
  output_path = "../main.zip"
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
      },
    ]
  })
}

resource "aws_iam_policy" "dynamodb_access" {
  name        = "DynamoDBAccessPolicy"
  description = "Policy to allow access to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        Resource = "arn:aws:dynamodb:${var.region}:*:table/${var.db_name}"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

resource "aws_lambda_function" "api_lambda" {
  function_name = "request-inbox-api"
  filename = data.archive_file.lambda-package.output_path
  source_code_hash = data.archive_file.lambda-package.output_base64sha256

  handler = "bootstrap"
  runtime = "provided.al2"

  role = aws_iam_role.lambda_exec_role.arn

  environment {
    variables = {
      API_MODE = "lambda"
      DB_ENGINE = "dynamo"
      PRINT_CONFIG = "false"
      ENABLE_LISTING_PUBLIC_INBOX = "false"
      SNAPSHOT_VERSION = var.api_snapshot_version
      LOGIN_GITHUB_CLIENT_ID = var.login_github_client_id
      LOGIN_GITHUB_CLIENT_SECRET = var.login_github_client_secret
      LOGIN_GITHUB_CALLBACK = var.login_github_callback
      LOGIN_GOOGLE_CLIENT_ID = var.login_google_client_id
      LOGIN_GOOGLE_CLIENT_SECRET = var.login_google_client_secret
      LOGIN_GOOGLE_CALLBACK = var.login_google_callback
      FRONTEND_APPLICATION_URL = var.frontend_application_url
      AUTH_COOKIE_DOMAIN = var.auth_cookie_domain
      JWT_SECRET = var.jwt_secret
      CORS_ALLOW_ORIGINS = var.cors_allow_origins
    }
  }
}

resource "aws_cloudwatch_log_group" "api_lambda_log_group" {
  name = "/aws/lambda/${aws_lambda_function.api_lambda.function_name}"
  retention_in_days = 90
}


resource "aws_apigatewayv2_api" "api" {
  name          = "request-inbox-apigw"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["*"]
    allow_methods     = ["*"]
    allow_origins     = ["*"]
    expose_headers    = ["*"]
    max_age           = 3600
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name = "/api/logs"
  retention_in_days = 30
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode(
      {
        httpMethod     = "$context.httpMethod"
        ip             = "$context.identity.sourceIp"
        protocol       = "$context.protocol"
        requestId      = "$context.requestId"
        requestTime    = "$context.requestTime"
        responseLength = "$context.responseLength"
        routeKey       = "$context.routeKey"
        status         = "$context.status"
      }
    )
  }

  lifecycle {
    ignore_changes = [
      deployment_id,
      default_route_settings
    ]
  }
}


resource "aws_apigatewayv2_integration" "integration" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  connection_type      = "INTERNET"
  description          = "This is our {proxy+} integration"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.api_lambda.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"

  lifecycle {
    ignore_changes = [
      passthrough_behavior
    ]
  }
}

resource "aws_apigatewayv2_route" "route" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "ANY /{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.integration.id}"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}


resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = var.api_domain_name

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.back_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  depends_on = [aws_acm_certificate_validation.back_validation]
}


resource "aws_route53_record" "api" {
  name    = aws_apigatewayv2_domain_name.api.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.public.zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.default.id
}


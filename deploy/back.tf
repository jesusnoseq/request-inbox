
resource "aws_s3_bucket_acl" "lambda_bucket" {
  bucket = "request-inbox-lambda-bucket"
  acl    = "private"
}

resource "aws_s3_object" "lambda_object" {
  bucket = aws_s3_bucket_acl.lambda_bucket.bucket
  key    = "back.zip"
  source = "../back.zip"
  etag   = filemd5("../back.zip")
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

resource "aws_lambda_function" "api_lambda" {
  function_name = "api"

  s3_bucket = aws_s3_bucket_acl.lambda_bucket.bucket
  s3_key    = aws_s3_object.lambda_object.key

  handler = "handler"
  runtime = "go1.x"

  role = aws_iam_role.lambda_exec_role.arn

  environment {
    variables = {
      API_MODE = "lambda"
    }
  }
}


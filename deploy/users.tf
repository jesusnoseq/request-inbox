
resource "aws_cognito_user_pool" "user_pool" {
  name = "request_inbox_user_pool"
  auto_verified_attributes = ["email"]

  schema {
    name     = "org_id"
    attribute_data_type = "String"
    mutable  = false
    required = false
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "request-inbox-user-pool-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id
  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]
}

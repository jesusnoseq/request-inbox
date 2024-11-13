resource "aws_dynamodb_table" "inbox_requests" {
  name           = var.db_name
  billing_mode   = "PAY_PER_REQUEST"
  read_capacity  = 0
  write_capacity = 0
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "OWNER_ID"
    type = "S"
  }

  global_secondary_index {
    name               = "OWNER_INDEX"
    hash_key           = "OWNER_ID"
    range_key          = "SK"
    write_capacity     = 0
    read_capacity      = 0
    projection_type    = "ALL"
  }
}
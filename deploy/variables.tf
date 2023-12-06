variable "region" {
  type    = string
  default = "eu-central-1"
}

variable "function_name" {
  type    = string
  default = "lambda"
}

variable "src_path" {
  type = string
  default = "api"
}

# variable "target_path" {
#   type = string
# }
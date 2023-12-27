variable "region" {
  type    = string
  default = "eu-central-1"
  description = "AWS Region"
}

variable "project_name" {
  type        = string
  default     = "request-inbox"
  description = "Project name"
}


variable "backend_bucket" {
  type        = string
  default     = "request-inbox-terraform-state-bucket"
  description = "backend bucket to save tf state"
}


variable "root_domain_name" {
  type = string
  default = "request-inbox.com"
}

variable "api_domain_name" {
  type = string
  default = "api.request-inbox.com"
}

variable "web_domain_name" {
  type = string
  default = "www.request-inbox.com"
}

# variable "hosted_zone_id" {
#   type = string
#   default = "Z07918491NGXTA3IZKH6T"
# }


variable "db_name" {
  type        = string
  default     = "inbox_requests"
  description = "dynamo db table name"
}

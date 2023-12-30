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

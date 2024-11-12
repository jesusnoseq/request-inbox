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

# variable "inbox_domain_name" {
#   type = string
#   default = "in.request-inbox.com"
# }

variable "db_name" {
  type = string
  default = "inbox_requests"
}

variable "API_SNAPSHOT_VERSION" {
  type = string
  default = "TF_SNAPSHOT_VERSION"
}

variable "LOGIN_GITHUB_CLIENT_ID" {
    type = string
}
variable "LOGIN_GITHUB_CLIENT_SECRET" {
    type = string
}
variable "LOGIN_GITHUB_CALLBACK" {
    type = string
}
variable "LOGIN_GOOGLE_CLIENT_ID" {
    type = string
}
variable "LOGIN_GOOGLE_CLIENT_SECRET" {
    type = string
}
variable "LOGIN_GOOGLE_CALLBACK" {
    type = string
}
variable "FRONTEND_APPLICATION_URL" {
    type = string
}
variable "AUTH_COOKIE_DOMAIN" {  
  type = string
}
variable "JWT_SECRET" {
    type = string
}



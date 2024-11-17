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

variable "api_snapshot_version" {
  type = string
  default = "TF_SNAPSHOT_VERSION"
}

variable "login_github_client_id" {
    type = string
}
variable "login_github_client_secret" {
    type = string
}
variable "login_github_callback" {
    type = string
}
variable "login_google_client_id" {
    type = string
}
variable "login_google_client_secret" {
    type = string
}
variable "login_google_callback" {
    type = string
}
variable "frontend_application_url" {
    type = string
}
variable "auth_cookie_domain" {  
  type = string
}
variable "jwt_secret" {
    type = string
}
variable "cors_allow_origins" {
    type = string
}
variable "user_jti_salt" {
    type = string
}

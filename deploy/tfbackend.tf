terraform {
  backend "s3" {
    bucket         = "request-inbox-terraform-state-bucket"
    key            = "terraform.tfstate"
    encrypt        = true
  }
}

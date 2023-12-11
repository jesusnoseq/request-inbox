terraform {
  required_version = "~> 1.6.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.29.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  backend "s3" {
    bucket         = "request-inbox-terraform-state"
    key            = "terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
  
  default_tags {
    tags = {
      ManagedBy = "Terraform"
      Project = var.project_name
    }
  }
}

provider "aws" {
  alias  = "acm_provider"
  region = "us-east-1"
}


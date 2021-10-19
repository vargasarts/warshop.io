terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "VargasArts"
    workspaces {
      prefix = "warshop-io"
    }
  }
  required_providers {
    github = {
      source = "integrations/github"
      version = "4.2.0"
    }
  }
}

variable "aws_access_token" {
  type = string
}

variable "aws_secret_token" {
  type = string
}

variable "github_token" {
  type = string
}

variable "secret" {
  type = string
}

provider "aws" {
  region = "us-east-1"
  access_key = var.aws_access_token
  secret_key = var.aws_secret_token
}

provider "github" {
  owner = "dvargas92495"
  token = var.github_token
}

module "aws_static_site" {
  source  = "dvargas92495/static-site/aws"
  version = "3.1.5"

  domain = "warshop.io"
  secret = var.secret
  tags = {
      Application = "warshop-io"
  }

  providers = {
    aws.us-east-1 = aws
  }
}

module "aws-serverless-backend" {
    source  = "dvargas92495/serverless-backend/aws"
    version = "1.5.14"

    api_name = "warshop-io"
    domain = "warshop.io"
    paths = [
      "game/post"
    ]

    tags = {
        Application = "warshop-io"
    }
}

resource "github_actions_secret" "deploy_aws_access_key" {
  repository       = "warshop.io"
  secret_name      = "DEPLOY_AWS_ACCESS_KEY"
  plaintext_value  = module.aws_static_site.deploy-id
}

resource "github_actions_secret" "deploy_aws_access_secret" {
  repository       = "warshop.io"
  secret_name      = "DEPLOY_AWS_ACCESS_SECRET"
  plaintext_value  = module.aws_static_site.deploy-secret
}

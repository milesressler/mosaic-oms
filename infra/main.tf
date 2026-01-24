provider "aws" {
  region  = "us-west-2"
  profile = "AdministratorAccess-638820400855"
}

# Provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = "AdministratorAccess-638820400855"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
  
  backend "s3" {
    bucket = "mosaic-oms-terraform-state"
    key    = "terraform.tfstate"
    region = "us-west-2"
  }
}
module "shutdown_schedule" {
  source = "./modules/shutdown_schedule"  # Adjust this path based on where the module is located

  # Pass any required variables for your module
  # instance_identifier = "mosaic-oms-dem-db"
  # start_time          = "22:00"  # Example start time
  # end_time            = "06:00"  # Example end time
}

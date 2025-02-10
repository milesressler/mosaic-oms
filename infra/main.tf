provider "aws" {
  region  = "us-west-2"
  profile = "AdministratorAccess-638820400855"
}

terraform {
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

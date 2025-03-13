resource "aws_lb" "mosaic-oms-alb" {
  name = "mosaic-oms-alb"
  internal           = false               # Set to true if it's an internal ALB
  load_balancer_type = "application"       # Use "network" for an NLB
  security_groups    = ["sg-059f6d66a844f8a33", "sg-053caa4f3f259bf8d"]     # Replace with security group IDs
  subnets           = ["subnet-051b4bbd1865b5c25", "subnet-0d360461e819e2161"]  # Replace with your subnets

  enable_deletion_protection = false       # Set to true if you want to prevent accidental deletion

}

resource "aws_security_group" "hazelcast_sg" {
  name        = "hazelcast-sg"
  description = "Allow Hazelcast communication"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5701
    to_port     = 5701
    protocol    = "tcp"
    self        = true # Allow access between tasks in the same SG
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_cluster" "main" {
  name = "mosaic-oms-prod"
  configuration {
    execute_command_configuration {
      logging = "DEFAULT"
    }
  }

  # Optional: If you're using ECS Service Connect (which you might be since a namespace is present)
  service_connect_defaults {
    namespace = "arn:aws:servicediscovery:us-west-2:638820400855:namespace/ns-jse2kjoqe3m4bwib"
  }
}


resource "aws_ecs_service" "mosaic" {
  name            = "mosaic-oms-service"
  cluster         = aws_ecs_cluster.main.id
  desired_count   = 1
  platform_version = "1.4.0"
  enable_ecs_managed_tags = true
  propagate_tags          = "NONE"
  enable_execute_command  = false
  scheduling_strategy     = "REPLICA"
  task_definition = var.task_definition_arn


  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = [
      "subnet-0d360461e819e2161",
      "subnet-051b4bbd1865b5c25",
      "subnet-02f5308c26435a648",
      "subnet-0f97fdcf812725e07"
    ]
    security_groups  = [
      "sg-05753e4aa9297ac77",      # existing SG (used for ALB, etc.)
      aws_security_group.hazelcast_sg.id  # new Hazelcast SG
    ]
    assign_public_ip = true
  }

  health_check_grace_period_seconds = 180

  load_balancer {
    target_group_arn = "arn:aws:elasticloadbalancing:us-west-2:638820400855:targetgroup/mosaic-oms-service-tg/56a1fefd31f9f0fd"
    container_name   = "mosaic-oms"
    container_port   = 8080
  }
}

variable "vpc_id" {
  description = "ID of the main Mosaic VPC"
  type        = string
}

variable "task_definition_arn" {
  description = "Task definition for ECS service"
  type        = string
}

variable "e2e_alert_email" {
  description = "Email address to notify when scheduled E2E tests fail"
  type        = string
}

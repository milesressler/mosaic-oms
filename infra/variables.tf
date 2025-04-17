variable "vpc_id" {
  description = "ID of the main Mosaic VPC"
  type        = string
}

variable "task_definition_arn" {
  description = "Task definition for ECS service"
  type        = string
}

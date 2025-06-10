resource "aws_iam_role" "lambda_role" {
  name               = "lambda_rds_control_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "lambda_rds_control_policy"
  description = "Policy to allow Lambda to stop and start RDS instance"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["rds:StartDBInstance", "rds:StopDBInstance"]
        Resource = "arn:aws:rds:us-west-2:638820400855:db:mosaic-oms-dem-db"  # Your RDS instance ARN
        Effect   = "Allow"
      },
      {
        Action   = "logs:*"
        Resource = "*"
        Effect   = "Allow"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}


resource "aws_iam_policy" "lambda_ecs_policy" {
  name        = "LambdaEcsPolicy"
  description = "Allow Lambda to manage ECS service"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices"
        ]
        Resource = "arn:aws:ecs:us-west-2:638820400855:service/mosaic-oms-prod/mosaic-oms-service"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_ecs_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_ecs_policy.arn
}

# Allow the Lambda to describe and modify your ALB listener
resource "aws_iam_policy" "lambda_alb_policy" {
  name        = "lambda_alb_control_policy"
  description = "Allow Lambda to describe and modify ALB listeners for failover switching"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:ModifyListener"
        ]
        # scope it down to your listener ARN(s).
        # Replace the * at the end with your actual listener ID if you want to be more restrictive.
        Resource = "arn:aws:elasticloadbalancing:us-west-2:638820400855:listener/app/mosaic-oms-alb/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_alb_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_alb_policy.arn
}

resource "aws_cloudwatch_event_rule" "stop_rds_ecs" {
  name                = "stop-rds-ecs"
  schedule_expression = "cron(0 6 ? * 2-7 *)"  # 1 AM UTC
}

resource "aws_cloudwatch_event_target" "stop_rds_ecs_lambda" {
  rule      = aws_cloudwatch_event_rule.stop_rds_ecs.name
  target_id = "LambdaFunction"
  arn       = aws_lambda_function.rds_control.arn
  input     = jsonencode({ "action": "stop_rds_ecs" })
}


resource "aws_cloudwatch_event_rule" "start_rds" {
  name                = "start-rds"
  schedule_expression = "cron(0 13 ? * 6,7 *)"  # 1 PM UTC (Saturday at 7 AM CT)
}

resource "aws_cloudwatch_event_target" "start_rds_lambda" {
  rule      = aws_cloudwatch_event_rule.start_rds.name
  target_id = "LambdaFunction"
  arn       = aws_lambda_function.rds_control.arn
  input     = jsonencode({ "action": "start_rds" })
}


resource "aws_cloudwatch_event_rule" "start_ecs" {
  name                = "start-ecs"
  schedule_expression = "cron(0 14 ? * 7 *)"  # 2 PM UTC (Saturday at 8 AM CT)
}

resource "aws_cloudwatch_event_target" "start_ecs_lambda" {
  rule      = aws_cloudwatch_event_rule.start_ecs.name
  target_id = "LambdaFunction"
  arn       = aws_lambda_function.rds_control.arn
  input     = jsonencode({ "action": "start_ecs" })
}


resource "aws_lambda_permission" "allow_cloudwatch_invoke_stop" {
  statement_id  = "AllowExecutionFromCloudWatchStop"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rds_control.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.stop_rds_ecs.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_invoke_start_rds" {
  statement_id  = "AllowExecutionFromCloudWatchStartRDS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rds_control.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.start_rds.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_invoke_start_ecs" {
  statement_id  = "AllowExecutionFromCloudWatchStartECS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rds_control.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.start_ecs.arn
}

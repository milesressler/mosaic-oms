resource "aws_lambda_function" "rds_control" {
  function_name = "RDSControlFunction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.10"
  filename      = "modules/shutdown_schedule/lambda_function.zip"  # Reference the zip file

  source_code_hash = filebase64sha256("modules/shutdown_schedule/lambda_function.zip")
}

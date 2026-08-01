# Build the deployment package from the handler source checked in beside this
# file, so the zip can never drift from lambda_function.py.
data "archive_file" "rds_control" {
  type        = "zip"
  source_file = "${path.module}/lambda_function.py"
  output_path = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "rds_control" {
  function_name = "RDSControlFunction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.14"

  filename         = data.archive_file.rds_control.output_path
  source_code_hash = data.archive_file.rds_control.output_base64sha256
}

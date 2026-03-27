# ── Scheduled E2E Tests ───────────────────────────────────────────────────────
#
# Runs Playwright E2E tests against portal.mosaicchurchaustin.com on a schedule:
#
#   • Saturday night  – cron(0 3 ? * SUN *) = 03:00 UTC Sun ≈ 9-10 PM CT Sat
#   • Sunday morning  – cron(0 12 ? * SUN *) = 12:00 UTC Sun ≈ 6-7 AM CT Sun
#
# Both windows fall inside the ECS up-time (service is running 12:05 UTC – 05:00 UTC).
#
# MANUAL STEPS AFTER terraform apply:
#   1. Confirm the SNS subscription email that AWS sends to var.e2e_alert_email.
#   2. Populate the Secrets Manager secret:
#        aws secretsmanager put-secret-value \
#          --secret-id mosaic-oms/e2e-test-credentials \
#          --secret-string '{"AUTH0_TEST_USER":"you@example.com","AUTH0_TEST_PW":"yourpassword"}'
#   3. If CodeBuild has not yet been connected to GitHub, go to:
#        CodeBuild console → Source credentials → Connect to GitHub (OAuth)
#      The existing deployment project likely already has this set up.
#
# ─────────────────────────────────────────────────────────────────────────────


# ── Secrets Manager – Auth0 credentials ──────────────────────────────────────

resource "aws_secretsmanager_secret" "e2e_credentials" {
  name        = "mosaic-oms/e2e-test-credentials"
  description = "Auth0 credentials used by the scheduled E2E Playwright tests"
}

# The secret_string is managed outside Terraform (populated via CLI / console).
# lifecycle ignore_changes prevents Terraform from overwriting it on re-apply.
resource "aws_secretsmanager_secret_version" "e2e_credentials_placeholder" {
  secret_id     = aws_secretsmanager_secret.e2e_credentials.id
  secret_string = jsonencode({
    AUTH0_TEST_USER = "REPLACE_ME",
    AUTH0_TEST_PW   = "REPLACE_ME"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}


# ── IAM – CodeBuild service role ──────────────────────────────────────────────

resource "aws_iam_role" "codebuild_e2e" {
  name = "codebuild-e2e-tests-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codebuild_e2e" {
  name = "codebuild-e2e-tests-policy"
  role = aws_iam_role.codebuild_e2e.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # CloudWatch Logs
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:us-west-2:638820400855:log-group:/aws/codebuild/mosaic-oms-e2e-tests:*"
      },
      {
        # S3 – CodeBuild artifact/cache bucket (uses the default bucket)
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:GetBucketAcl",
          "s3:GetBucketLocation"
        ]
        Resource = "*"
      },
      {
        # Read Auth0 credentials from Secrets Manager
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.e2e_credentials.arn
      },
      {
        # CodeBuild test reports
        Effect   = "Allow"
        Action   = ["codebuild:CreateReportGroup", "codebuild:CreateReport", "codebuild:UpdateReport", "codebuild:BatchPutTestCases"]
        Resource = "arn:aws:codebuild:us-west-2:638820400855:report-group/mosaic-oms-e2e-tests-*"
      }
    ]
  })
}


# ── CodeBuild project ─────────────────────────────────────────────────────────

resource "aws_codebuild_project" "e2e_tests" {
  name          = "mosaic-oms-e2e-tests"
  description   = "Scheduled Playwright E2E tests against portal.mosaicchurchaustin.com"
  service_role  = aws_iam_role.codebuild_e2e.arn
  build_timeout = 15 # minutes – full lifecycle test + Playwright install

  source {
    type      = "GITHUB"
    location  = "https://github.com/milesressler/mosaic-oms"
    buildspec = "buildspec-e2e.yml"

    git_submodules_config {
      fetch_submodules = false
    }
  }

  source_version = "master" # branch to check out

  environment {
    type                        = "LINUX_CONTAINER"
    image                       = "aws/codebuild/standard:7.0" # Node 20 available
    compute_type                = "BUILD_GENERAL1_MEDIUM"       # 4 vCPU, 7 GB – comfortable for Playwright + Chromium
    image_pull_credentials_type = "CODEBUILD"

    # Auth0 credentials injected from Secrets Manager at build time
    environment_variable {
      name  = "AUTH0_TEST_USER"
      value = "${aws_secretsmanager_secret.e2e_credentials.name}:AUTH0_TEST_USER"
      type  = "SECRETS_MANAGER"
    }

    environment_variable {
      name  = "AUTH0_TEST_PW"
      value = "${aws_secretsmanager_secret.e2e_credentials.name}:AUTH0_TEST_PW"
      type  = "SECRETS_MANAGER"
    }
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/mosaic-oms-e2e-tests"
      stream_name = ""
      status      = "ENABLED"
    }
  }
}


# ── IAM – EventBridge → CodeBuild ────────────────────────────────────────────

resource "aws_iam_role" "eventbridge_e2e_trigger" {
  name = "eventbridge-e2e-trigger-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_e2e_trigger" {
  name = "eventbridge-e2e-trigger-policy"
  role = aws_iam_role.eventbridge_e2e_trigger.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["codebuild:StartBuild"]
      Resource = aws_codebuild_project.e2e_tests.arn
    }]
  })
}


# ── EventBridge schedules ─────────────────────────────────────────────────────

# Saturday night  (03:00 UTC Sunday  = ~9-10 PM CT Saturday)
resource "aws_cloudwatch_event_rule" "e2e_saturday_night" {
  name                = "mosaic-oms-e2e-saturday-night"
  description         = "Trigger E2E tests Saturday night (~10 PM CT) before overnight shutdown"
  schedule_expression = "cron(0 3 ? * SUN *)"
}

resource "aws_cloudwatch_event_target" "e2e_saturday_night" {
  rule      = aws_cloudwatch_event_rule.e2e_saturday_night.name
  target_id = "E2ETestsSaturdayNight"
  arn       = aws_codebuild_project.e2e_tests.arn
  role_arn  = aws_iam_role.eventbridge_e2e_trigger.arn
}

# Sunday morning  (14:00 UTC Sunday  = ~9 AM CT Sunday)
resource "aws_cloudwatch_event_rule" "e2e_sunday_morning" {
  name                = "mosaic-oms-e2e-sunday-morning"
  description         = "Trigger E2E tests Sunday morning (~7 AM CT) after overnight startup"
  schedule_expression = "cron(0 12 ? * SUN *)"
}

resource "aws_cloudwatch_event_target" "e2e_sunday_morning" {
  rule      = aws_cloudwatch_event_rule.e2e_sunday_morning.name
  target_id = "E2ETestsSundayMorning"
  arn       = aws_codebuild_project.e2e_tests.arn
  role_arn  = aws_iam_role.eventbridge_e2e_trigger.arn
}


# ── SNS topic + email alert on failure ───────────────────────────────────────

resource "aws_sns_topic" "e2e_alerts" {
  name = "mosaic-oms-e2e-alerts"
}

# NOTE: after apply, AWS sends a confirmation email to this address.
# The subscription is inactive until that email is confirmed.
resource "aws_sns_topic_subscription" "e2e_email" {
  topic_arn = aws_sns_topic.e2e_alerts.arn
  protocol  = "email"
  endpoint  = var.e2e_alert_email
}

# Allow EventBridge to publish to the SNS topic
resource "aws_sns_topic_policy" "e2e_alerts" {
  arn = aws_sns_topic.e2e_alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowEventBridgePublish"
      Effect = "Allow"
      Principal = {
        Service = "events.amazonaws.com"
      }
      Action   = "SNS:Publish"
      Resource = aws_sns_topic.e2e_alerts.arn
    }]
  })
}

# Watch for FAILED builds on the E2E project only
resource "aws_cloudwatch_event_rule" "e2e_build_failed" {
  name        = "mosaic-oms-e2e-build-failed"
  description = "Fire when the E2E test CodeBuild project fails"

  event_pattern = jsonencode({
    source      = ["aws.codebuild"]
    detail-type = ["CodeBuild Build State Change"]
    detail = {
      "build-status" = ["FAILED"]
      "project-name" = [aws_codebuild_project.e2e_tests.name]
    }
  })
}

resource "aws_cloudwatch_event_target" "e2e_build_failed_sns" {
  rule      = aws_cloudwatch_event_rule.e2e_build_failed.name
  target_id = "E2EFailureEmail"
  arn       = aws_sns_topic.e2e_alerts.arn

  input_transformer {
    input_paths = {
      project  = "$.detail.project-name"
      status   = "$.detail.build-status"
      deeplink = "$.detail.additional-information.logs.deep-link"
    }
    input_template = "\"Mosaic OMS E2E tests FAILED\\n\\nProject : <project>\\nStatus  : <status>\\nLogs    : <deeplink>\""
  }
}

import boto3
import os
import traceback

region = "us-west-2"

rds_client = boto3.client("rds", region_name=region)
ecs_client = boto3.client("ecs", region_name=region)
elb = boto3.client("elbv2", region_name=region)

# Pulled from your inputs:
LISTENER_ARN     = "arn:aws:elasticloadbalancing:us-west-2:638820400855:listener/app/mosaic-oms-alb/cf2a35f3f0a7b184/17ba064a391b88c2"
TARGET_GROUP_ARN = "arn:aws:elasticloadbalancing:us-west-2:638820400855:targetgroup/mosaic-oms-service-tg/56a1fefd31f9f0fd"

# Your friendly HTML page:
FALLBACK_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Be Right Back!</title>
  <meta http-equiv="refresh" content="3600">
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f9f9f9;
      color: #333;
      text-align: center;
      padding: 4rem;
    }
    .cloud {
      font-size: 5rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 1.2rem;
      margin-top: 0;
    }
    footer {
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="cloud">☁️</div>
  <h1>Recharging Overnight</h1>
  <p>We power down nightly to keep costs low—our servers are just taking a nap!</p>
  <p>This page will auto-reload in an hour.</p>
  <footer>Feel free to hit refresh anytime.</footer>
</body>
</html>"""


# Pre-define the two listener actions:
FORWARD_ACTION = {
    'Type': 'forward',
    'ForwardConfig': {
        'TargetGroups': [
            {'TargetGroupArn': TARGET_GROUP_ARN, 'Weight': 1}
        ]
    }
}

FIXED_RESPONSE_ACTION = {
    'Type': 'fixed-response',
    'FixedResponseConfig': {
        'ContentType': 'text/html',
        'StatusCode': '503',
        'MessageBody': FALLBACK_HTML
    }
}


def lambda_handler(event, context):
    action      = event.get("action", "")
    ECS_CLUSTER = event.get("ecs_cluster", "")
    ECS_SERVICE = event.get("ecs_service", "")
    DB_INSTANCE = event.get("db_instance", "")

    # 1) Stop both RDS + ECS → switch ALB to fallback
    if action == "stop_rds_ecs":
        # stop RDS
        try:
            print("Stopping RDS instance...")
            rds_client.stop_db_instance(DBInstanceIdentifier=DB_INSTANCE)
        except Exception:
            print("Failed stopping RDS instance.", traceback.format_exc())

        # stop ECS
        try:
            print("Stopping ECS service...")
            resp = ecs_client.update_service(
                cluster=ECS_CLUSTER,
                service=ECS_SERVICE,
                desiredCount=0
            )
            print("ECS update_service response:", resp)
        except Exception:
            print("Failed stopping ECS service.", traceback.format_exc())

        # switch ALB to fallback page
        try:
            print("Switching ALB listener to fixed-response fallback...")
            elb.modify_listener(
                ListenerArn=LISTENER_ARN,
                DefaultActions=[FIXED_RESPONSE_ACTION]
            )
        except Exception:
            print("Failed modifying ALB listener for fallback.", traceback.format_exc())

    # 2) Start ECS → switch ALB back to forwarding
    elif action == "start_ecs":
        try:
            print("Starting ECS service...")
            ecs_client.update_service(
                cluster=ECS_CLUSTER,
                service=ECS_SERVICE,
                desiredCount=1
            )
        except Exception:
            print("Failed starting ECS service.", traceback.format_exc())

        # revert ALB listener to forward to your TG
        try:
            print("Reverting ALB listener to forward to target group...")
            elb.modify_listener(
                ListenerArn=LISTENER_ARN,
                DefaultActions=[FORWARD_ACTION]
            )
        except Exception:
            print("Failed modifying ALB listener to forward action.", traceback.format_exc())

    # 3) Start RDS only
    elif action == "start_rds":
        try:
            print("Starting RDS instance...")
            rds_client.start_db_instance(DBInstanceIdentifier=DB_INSTANCE)
        except Exception:
            print("Failed starting RDS instance.", traceback.format_exc())

    # (You could also add a combined "start_rds_ecs" if desired.)

    return {"status": "success"}

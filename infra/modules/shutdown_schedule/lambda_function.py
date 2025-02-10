import boto3
import os

region = "us-west-2"

rds_client = boto3.client("rds", region_name=region)
ecs_client = boto3.client("ecs", region_name=region)

DB_INSTANCE_ID = "mosaic-oms-dem-db"
ECS_CLUSTER = "mosaic-oms-cluster"
ECS_SERVICE = "mosaic-oms-service"

def lambda_handler(event, context):
    action = event.get("action", "")

    if action == "stop_rds_ecs":
        print("Stopping RDS instance...")
        rds_client.stop_db_instance(DBInstanceIdentifier=DB_INSTANCE_ID)

        print("Stopping ECS service...")
        ecs_client.update_service(
            cluster=ECS_CLUSTER,
            service=ECS_SERVICE,
            desiredCount=0
        )

    elif action == "start_rds":
        print("Starting RDS instance...")
        rds_client.start_db_instance(DBInstanceIdentifier=DB_INSTANCE_ID)

    elif action == "start_ecs":
        print("Starting ECS service...")
        ecs_client.update_service(
            cluster=ECS_CLUSTER,
            service=ECS_SERVICE,
            desiredCount=1
        )

    return {"status": "success"}

import boto3
import os
import traceback

region = "us-west-2"

rds_client = boto3.client("rds", region_name=region)
ecs_client = boto3.client("ecs", region_name=region)


def lambda_handler(event, context):
    action = event.get("action", "")
    ECS_CLUSTER = event.get("ecs_cluster", "")
    ECS_SERVICE = event.get("ecs_service", "")
    DB_INSTANCE_ID = event.get("db_instance", "")

    if action == "stop_rds_ecs":
        try:
            print("Stopping RDS instance...")
            rds_client.stop_db_instance(DBInstanceIdentifier=DB_INSTANCE_ID)
        except:
            print("Failed stopping RDS instance.")



        try:
            print("Stopping ECS service...")
            response = ecs_client.update_service(
                cluster=ECS_CLUSTER,
                service=ECS_SERVICE,
                desiredCount=0
            )
            print("Update service response:", response)
        except Exception as e:
            print("Failed stopping ECS service.")
            print("Exception:", str(e))
            traceback.print_exc()


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

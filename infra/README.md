# AWS Infrastructure for Gym Workout Tracker

## Prerequisites
- Terraform >= 1.5
- AWS credentials configured

## Variables
- `project_name` (required)
- `aws_region` (default: `us-east-1`)
- `db_name` (default: `gym_tracker`)
- `db_username` (required)
- `db_password` (required)

## Usage
```bash
terraform init
terraform apply -var 'project_name=gym-workout-tracker' -var 'db_username=admin' -var 'db_password=CHANGE_ME'
```

## Outputs
- `rds_cluster_arn` → use as `RDS_CLUSTER_ARN`
- `rds_secret_arn` → use as `RDS_SECRET_ARN`
- `rds_database_name` → use as `RDS_DATABASE_NAME`
- `aws_region` → use as `AWS_REGION`


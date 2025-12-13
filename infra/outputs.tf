output "rds_cluster_arn" {
  value = aws_rds_cluster.main.arn
}

output "rds_secret_arn" {
  value = aws_secretsmanager_secret.db.arn
}

output "rds_database_name" {
  value = var.db_name
}

output "aws_region" {
  value = var.aws_region
}


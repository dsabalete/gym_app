resource "aws_rds_cluster_parameter_group" "aurora_mysql" {
  name        = "${var.project_name}-aurora-mysql-pg"
  family      = "aurora-mysql8.0"
  description = "Parameter group for Aurora MySQL 8.0"
}

resource "aws_rds_cluster" "main" {
  cluster_identifier        = "${var.project_name}-aurora-cluster"
  engine                    = "aurora-mysql"
  engine_version            = var.engine_version
  database_name             = var.db_name
  master_username           = var.db_username
  master_password           = var.db_password
  db_subnet_group_name      = aws_db_subnet_group.rds.name
  vpc_security_group_ids    = [aws_security_group.rds.id]
  enable_http_endpoint      = true
  apply_immediately         = true
  deletion_protection       = false
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.aurora_mysql.name

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 2
  }

  tags = {
    Name = "${var.project_name}-aurora-cluster"
  }
}

resource "aws_rds_cluster_instance" "main" {
  count               = 1
  identifier          = "${var.project_name}-aurora-instance-${count.index}"
  cluster_identifier  = aws_rds_cluster.main.id
  instance_class      = "db.serverless"
  engine              = aws_rds_cluster.main.engine
  engine_version      = aws_rds_cluster.main.engine_version
  publicly_accessible = false

  tags = {
    Name = "${var.project_name}-aurora-instance-${count.index}"
  }
}

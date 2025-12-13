data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "private" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false
  tags = {
    Name = "${var.project_name}-private-${count.index}"
  }
}

resource "aws_db_subnet_group" "rds" {
  name       = "${var.project_name}-rds-subnets"
  subnet_ids = aws_subnet.private[*].id
  tags = {
    Name = "${var.project_name}-rds-subnets"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}


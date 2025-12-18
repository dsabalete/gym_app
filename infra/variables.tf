variable "project_name" {
  type = string
  default = "gym-app"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "az_count" {
  type    = number
  default = 2
}

variable "enable_static_hosting" {
  type    = bool
  default = true
  description = "Enable provisioning of S3+CloudFront for static hosting"
}

variable "domain_name" {
  type    = string
  default = "davidsabalete.com"
}

variable "subdomain" {
  type    = string
  default = "gym"
}

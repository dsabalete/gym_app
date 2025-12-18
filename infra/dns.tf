# ACM Certificate for SSL/TLS
# Note: You'll need to manually add the DNS validation records at your DNS provider
resource "aws_acm_certificate" "cert" {
  domain_name       = "${var.subdomain}.${var.domain_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Project = var.project_name
  }
}

# Manual validation - no automatic Route 53 records
# Use the outputs to get the DNS records you need to add at your DNS provider

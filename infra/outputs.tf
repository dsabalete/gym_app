output "aws_region" {
  value = var.aws_region
}

output "static_s3_bucket_name" {
  value       = try(aws_s3_bucket.static_site.bucket, null)
  description = "Name of the S3 bucket for static site"
}

output "cloudfront_distribution_id" {
  value       = try(aws_cloudfront_distribution.static_site.id, null)
  description = "CloudFront distribution ID for static site"
}

output "cloudfront_domain_name" {
  value       = try(aws_cloudfront_distribution.static_site.domain_name, null)
  description = "CloudFront domain name for static site"
}

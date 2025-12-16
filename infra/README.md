# AWS Infrastructure for Gym App

## Prerequisites
- `terraform` >= 1.5
- AWS credentials configured (OIDC or access keys)

## Variables
- `project_name` (required)
- `aws_region` (default: `us-east-1`)
- `vpc_cidr` (default: `10.0.0.0/16`)
- `az_count` (default: `2`)
- `enable_static_hosting` (default: `true`)

## Static Hosting (S3 + CloudFront)
Provision an S3 bucket and CloudFront distribution for Nuxt `generate` output.

### Apply
```bash
terraform init
terraform apply -var 'project_name=gym-app'
```

### Deploy Site Artifacts
After `nuxt generate`, sync the output directory (Nuxt 4 default: `.output/public`) to the provisioned bucket and invalidate CloudFront cache.
```bash
aws s3 sync .output/public s3://$(terraform output -raw static_s3_bucket_name) --delete
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths '/*'
```

## Outputs
- `aws_region` → use as `AWS_REGION`
- `static_s3_bucket_name`
- `cloudfront_distribution_id`
- `cloudfront_domain_name`

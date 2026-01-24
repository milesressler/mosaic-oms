# PostHog CloudFront Proxy Configuration
# This creates a CloudFront distribution that proxies requests to PostHog
# to improve performance and avoid ad-blockers

# Random ID for unique resource names
resource "random_id" "posthog_id" {
  byte_length = 8
}

# Using existing Route53 hosted zone ID
locals {
  route53_zone_id = "Z01730921297Q2J7CG14B"
}

# Create ACM certificate in us-east-1 for CloudFront
resource "aws_acm_certificate" "cloudfront_cert" {
  provider          = aws.us_east_1
  domain_name       = "*.portal.mosaicstreetministry.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "Portal CloudFront Certificate"
  }
}

# DNS validation records for the certificate
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cloudfront_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.route53_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "cloudfront_cert" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.cloudfront_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# CloudFront cache policy for PostHog (following PostHog guide)
# Only includes Origin and Authorization headers as recommended
resource "aws_cloudfront_cache_policy" "posthog_cache_policy" {
  name        = "posthog-cache-policy-${random_id.posthog_id.hex}"
  comment     = "Cache policy for PostHog proxy - Origin and Authorization headers only"
  default_ttl = 86400  # 1 day
  max_ttl     = 31536000  # 1 year
  min_ttl     = 1

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "all"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = [
          "Authorization",
          "Origin"
        ]
      }
    }

    cookies_config {
      cookie_behavior = "all"
    }
  }
}

# CloudFront cache policy for PostHog static assets (longer caching)
resource "aws_cloudfront_cache_policy" "posthog_static_cache_policy" {
  name        = "posthog-static-cache-policy-${random_id.posthog_id.hex}"
  comment     = "Cache policy for PostHog static assets (JS SDK, etc)"
  default_ttl = 86400     # 1 day
  max_ttl     = 31536000  # 1 year
  min_ttl     = 86400     # 1 day minimum

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "none"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = [
          "Origin",
          "Referer"
        ]
      }
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# AWS built-in policy IDs
locals {
  cors_custom_origin_policy_id = "59781a5b-3903-41f3-afcb-af62929ccde1"  # CORS-CustomOrigin
  cors_with_preflight_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"  # CORS-with-preflight-and-SecurityHeadersPolicy
}

# CloudFront distribution for PostHog proxy
resource "aws_cloudfront_distribution" "posthog_proxy" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "PostHog proxy distribution"
  default_root_object = ""

  aliases = ["aggregator.portal.mosaicstreetministry.com"]

  # Origin pointing to PostHog US API endpoint
  origin {
    domain_name = "us.i.posthog.com"
    origin_id   = "posthog-us-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin pointing to PostHog US static assets
  origin {
    domain_name = "us-assets.i.posthog.com"
    origin_id   = "posthog-us-assets"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default cache behavior for PostHog endpoints
  default_cache_behavior {
    allowed_methods                = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods                 = ["GET", "HEAD", "OPTIONS"]
    target_origin_id               = "posthog-us-api"
    cache_policy_id                = aws_cloudfront_cache_policy.posthog_cache_policy.id
    origin_request_policy_id       = local.cors_custom_origin_policy_id
    compress                       = true
    viewer_protocol_policy         = "redirect-to-https"

    # Use AWS built-in CORS policy
    response_headers_policy_id = local.cors_with_preflight_policy_id
  }

  # Cache behavior for PostHog JavaScript SDK and static assets
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "posthog-us-assets"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id              = aws_cloudfront_cache_policy.posthog_static_cache_policy.id
    origin_request_policy_id     = local.cors_custom_origin_policy_id
    response_headers_policy_id   = local.cors_with_preflight_policy_id
  }

  # Geo restrictions (optional - remove if not needed)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate configuration
  # Wait for certificate validation before creating distribution
  depends_on = [aws_acm_certificate_validation.cloudfront_cert]
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cloudfront_cert.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Price class (optional - adjust based on your needs)
  price_class = "PriceClass_100"  # US, Canada, Europe

  tags = {
    Name        = "PostHog Proxy"
    Environment = "production"
    Purpose     = "Analytics Proxy"
  }
}


# Route53 record for the PostHog proxy subdomain
resource "aws_route53_record" "posthog_proxy" {
  zone_id = local.route53_zone_id
  name    = "aggregator.portal.mosaicstreetministry.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.posthog_proxy.domain_name
    zone_id                = aws_cloudfront_distribution.posthog_proxy.hosted_zone_id
    evaluate_target_health = false
  }
}

# Output the CloudFront distribution domain
output "posthog_proxy_domain" {
  description = "CloudFront distribution domain for PostHog proxy"
  value       = aws_cloudfront_distribution.posthog_proxy.domain_name
}

output "posthog_proxy_custom_domain" {
  description = "Custom domain for PostHog proxy"
  value       = "aggregator.portal.mosaicstreetministry.com"
}

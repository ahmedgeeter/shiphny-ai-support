output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "ecr_repository_urls" {
  description = "URLs of the created ECR repositories"
  value       = { for repo, ecr in aws_ecr_repository.shippny_repos : repo => ecr.repository_url }
}

output "configure_kubectl" {
  description = "Command to configure kubectl to interact with the new EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "shippny-eks-cluster"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "node_instance_types" {
  description = "List of instance types for the EKS managed node groups"
  type        = list(string)
  default     = ["t3.large"]
}

variable "ecr_repository_names" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["shippny-backend", "shippny-frontend"]
}

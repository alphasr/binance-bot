#!/bin/bash

# Script to set up static IP for Cloud Run using Cloud NAT
# This gives your Cloud Run service a fixed IP address for Binance API whitelist

PROJECT_ID="temp-463920"
REGION="us-central1"
VPC_NAME="binance-vpc"
SUBNET_NAME="binance-subnet"
ROUTER_NAME="binance-router"
NAT_NAME="binance-nat"
STATIC_IP_NAME="binance-static-ip"

echo "Setting up static IP for Cloud Run..."

# 1. Create VPC network
gcloud compute networks create $VPC_NAME \
    --subnet-mode=custom \
    --project=$PROJECT_ID

# 2. Create subnet
gcloud compute networks subnets create $SUBNET_NAME \
    --network=$VPC_NAME \
    --range=10.0.0.0/24 \
    --region=$REGION \
    --project=$PROJECT_ID

# 3. Reserve static IP
gcloud compute addresses create $STATIC_IP_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

# 4. Create router
gcloud compute routers create $ROUTER_NAME \
    --network=$VPC_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

# 5. Create NAT gateway with static IP
gcloud compute routers nats create $NAT_NAME \
    --router=$ROUTER_NAME \
    --region=$REGION \
    --nat-external-ip-pool=$STATIC_IP_NAME \
    --nat-all-subnet-ip-ranges \
    --auto-allocate-nat-external-ips \
    --project=$PROJECT_ID

# 6. Get the static IP
STATIC_IP=$(gcloud compute addresses describe $STATIC_IP_NAME --region=$REGION --project=$PROJECT_ID --format="value(address)")

echo "Static IP created: $STATIC_IP"
echo "Add this IP to your Binance API whitelist: $STATIC_IP"

# 7. Deploy Cloud Run with VPC connector
echo "Now deploy your Cloud Run service with VPC connector..."
echo "gcloud run deploy binance-trading-bot \\"
echo "  --image gcr.io/$PROJECT_ID/binance-trading-bot:latest \\"
echo "  --platform managed \\"
echo "  --region $REGION \\"
echo "  --vpc-connector $VPC_NAME \\"
echo "  --vpc-egress all-traffic \\"
echo "  --project $PROJECT_ID"

#!/bin/bash

# Simple GCP deployment script for existing project
set -e

echo "🚀 Deploying to GCP project: temp-463920"

# Configuration
PROJECT_ID="temp-463920"
REGION="us-central1"
SERVICE_NAME="binance-bot"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Set project
gcloud config set project $PROJECT_ID

# Build the Docker image locally and push to Container Registry
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing image to Container Registry..."
docker push $IMAGE_NAME

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 900 \
  --max-instances 1 \
  --set-env-vars NODE_ENV=production

echo "✅ Deployment complete!"
echo "🔗 Service URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"

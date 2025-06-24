#!/bin/bash

# Google Cloud Platform Deployment Script for Binance Trading Bot
# This script automates the deployment process to GCP Cloud Run

set -e  # Exit on any error

echo "🚀 Starting GCP deployment for Binance Trading Bot..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_ID="temp-463920"
REGION="us-central1"
SERVICE_NAME="binance-bot"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION" 
echo "  Service Name: $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI not found!${NC}"
    echo "Please install it first:"
    echo "  brew install google-cloud-sdk"
    echo "  Or visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}🔐 Logging into Google Cloud...${NC}"
    gcloud auth login
fi

# Function to set existing project
set_existing_project() {
    echo -e "${BLUE}🏗️  Using existing GCP project: $PROJECT_ID${NC}"
    
    # Set current project
    gcloud config set project $PROJECT_ID
    
    echo -e "${GREEN}✅ Project configured: $PROJECT_ID${NC}"
}

# Function to enable required APIs
enable_apis() {
    echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
    
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    gcloud services enable secretmanager.googleapis.com
    
    echo -e "${GREEN}✅ APIs enabled${NC}"
}

# Function to set up billing (required for deployment)
setup_billing() {
    echo -e "${YELLOW}💳 Billing Account Setup${NC}"
    echo "You need to set up billing to deploy to Cloud Run."
    echo "Visit: https://console.cloud.google.com/billing"
    echo "Link your billing account to project: $PROJECT_ID"
    read -p "Press Enter when billing is set up..."
}

# Function to create secrets for API keys
create_secrets() {
    echo -e "${BLUE}🔒 Setting up API key secrets...${NC}"
    
    read -s -p "Enter your Binance API Key: " BINANCE_API_KEY
    echo ""
    read -s -p "Enter your Binance API Secret: " BINANCE_API_SECRET
    echo ""
    
    # Create secrets
    echo -n "$BINANCE_API_KEY" | gcloud secrets create binance-api-key --data-file=-
    echo -n "$BINANCE_API_SECRET" | gcloud secrets create binance-api-secret --data-file=-
    
    echo -e "${GREEN}✅ Secrets created${NC}"
}

# Function to build and deploy
build_and_deploy() {
    echo -e "${BLUE}🏗️  Building and deploying bot...${NC}"
    
    # Build TypeScript
    echo "Building TypeScript..."
    npm run build
    
    # Submit build to Cloud Build
    gcloud builds submit --config cloudbuild.yaml .
    
    # Update service to use secrets
    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --set-secrets="BINANCE_API_KEY=binance-api-key:latest,BINANCE_API_SECRET=binance-api-secret:latest"
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
}

# Function to set up Cloud Scheduler for timing
setup_scheduler() {
    echo -e "${BLUE}⏰ Setting up Cloud Scheduler...${NC}"
    
    # Enable Cloud Scheduler API
    gcloud services enable cloudscheduler.googleapis.com
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    
    # Create scheduled job for 4:33 PM Prague time (CET/CEST)
    gcloud scheduler jobs create http trading-schedule \
        --schedule="33 16 * * *" \
        --uri="$SERVICE_URL/execute" \
        --http-method=POST \
        --time-zone="Europe/Prague" \
        --description="Daily trading execution at 4:33 PM Prague time"
    
    echo -e "${GREEN}✅ Scheduler configured for 4:33 PM Prague time${NC}"
}

# Function to set up monitoring
setup_monitoring() {
    echo -e "${BLUE}📊 Setting up monitoring...${NC}"
    
    # Enable monitoring API
    gcloud services enable monitoring.googleapis.com
    
    echo "Monitoring dashboard: https://console.cloud.google.com/monitoring"
    echo "Logs: https://console.cloud.google.com/logs"
    
    echo -e "${GREEN}✅ Monitoring configured${NC}"
}

# Function to display final information
show_completion_info() {
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}📊 Your trading bot is now running on Google Cloud!${NC}"
    echo ""
    echo "🔗 Important Links:"
    echo "  • Cloud Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID"
    echo "  • Logs: https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
    echo "  • Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID"
    echo ""
    echo "⏰ Schedule: Bot executes at 4:33 PM Prague time daily"
    echo "💰 Estimated Cost: \$5-15/month"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  1. Monitor the logs for the first execution"
    echo "  2. Set up alerts for trading failures"
    echo "  3. Review and adjust position sizes"
    echo "  4. Monitor performance in Cloud Console"
    echo ""
}

# Main deployment flow
main() {
    echo -e "${GREEN}Starting GCP deployment process...${NC}"
    
    # Check prerequisites
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: package.json not found. Run this script from your bot directory.${NC}"
        exit 1
    fi
    
    # Deployment steps
    set_existing_project
    setup_billing
    enable_apis
    create_secrets
    build_and_deploy
    setup_scheduler
    setup_monitoring
    show_completion_info
}

# Run main function
main "$@"

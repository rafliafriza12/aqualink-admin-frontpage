#!/bin/bash

# Flowin Admin Panel Deployment Script
# This script deploys the Flowin Admin Panel to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is installed: $DOCKER_VERSION"
    else
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose is installed: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t flowin/admin-panel:latest .
    
    # Build backend (if exists)
    if [ -d "../aqualink-backend" ]; then
        print_status "Building backend image..."
        docker build -t flowin/backend:latest ../aqualink-backend
    fi
    
    print_success "Docker images built successfully"
}

# Deploy with Docker Compose
deploy_with_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down
    
    # Start new containers
    print_status "Starting new containers..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check health
    print_status "Checking service health..."
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Services are healthy"
    else
        print_warning "Health check failed, but deployment may still be successful"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_success "Deployed to Vercel successfully"
    else
        print_warning "Vercel CLI not found. Please install it or deploy manually."
    fi
}

# Deploy to Docker Hub
deploy_to_docker_hub() {
    print_status "Deploying to Docker Hub..."
    
    if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
        
        # Tag and push images
        docker tag flowin/admin-panel:latest $DOCKER_USERNAME/flowin-admin-panel:latest
        docker tag flowin/admin-panel:latest $DOCKER_USERNAME/flowin-admin-panel:$(git rev-parse --short HEAD)
        
        docker push $DOCKER_USERNAME/flowin-admin-panel:latest
        docker push $DOCKER_USERNAME/flowin-admin-panel:$(git rev-parse --short HEAD)
        
        print_success "Deployed to Docker Hub successfully"
    else
        print_warning "Docker Hub credentials not found. Skipping Docker Hub deployment."
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if [ -f "package.json" ]; then
        npm test
        print_success "Tests passed"
    else
        print_warning "No package.json found. Skipping tests."
    fi
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  Flowin Admin Panel Deployment"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Run tests
    run_tests
    
    # Build images
    build_images
    
    # Deploy based on environment
    case "${1:-docker}" in
        "docker")
            deploy_with_compose
            ;;
        "vercel")
            deploy_to_vercel
            ;;
        "dockerhub")
            deploy_to_docker_hub
            ;;
        "all")
            deploy_with_compose
            deploy_to_vercel
            deploy_to_docker_hub
            ;;
        *)
            print_error "Unknown deployment target: $1"
            print_status "Available targets: docker, vercel, dockerhub, all"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:3001"
    echo "   Grafana: http://localhost:3001:3000"
    echo "   Prometheus: http://localhost:9090"
    echo ""
    echo "📊 Monitoring:"
    echo "   Health Check: http://localhost/health"
    echo "   Metrics: http://localhost/api/metrics"
    echo ""
    echo "🔧 Management:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo ""
    echo "Happy deployment! 🚀"
}

# Run main function
main "$@"

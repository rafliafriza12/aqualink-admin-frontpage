# Flowin Admin Panel Deployment Script for Windows
# This script deploys the Flowin Admin Panel to production

param(
    [string]$Target = "docker",
    [switch]$SkipTests,
    [switch]$Verbose
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if Docker is installed
function Test-Docker {
    Write-Status "Checking Docker installation..."
    
    try {
        $dockerVersion = docker --version
        Write-Success "Docker is installed: $dockerVersion"
        return $true
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop."
        return $false
    }
}

# Check if Docker Compose is installed
function Test-DockerCompose {
    Write-Status "Checking Docker Compose installation..."
    
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose is installed: $composeVersion"
        return $true
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose."
        return $false
    }
}

# Build Docker images
function Build-Images {
    Write-Status "Building Docker images..."
    
    try {
        # Build frontend
        Write-Status "Building frontend image..."
        docker build -t flowin/admin-panel:latest .
        
        # Build backend (if exists)
        if (Test-Path "../aqualink-backend") {
            Write-Status "Building backend image..."
            docker build -t flowin/backend:latest ../aqualink-backend
        }
        
        Write-Success "Docker images built successfully"
        return $true
    }
    catch {
        Write-Error "Failed to build Docker images: $_"
        return $false
    }
}

# Deploy with Docker Compose
function Deploy-WithCompose {
    Write-Status "Deploying with Docker Compose..."
    
    try {
        # Stop existing containers
        Write-Status "Stopping existing containers..."
        docker-compose down
        
        # Start new containers
        Write-Status "Starting new containers..."
        docker-compose up -d
        
        # Wait for services to be ready
        Write-Status "Waiting for services to be ready..."
        Start-Sleep -Seconds 30
        
        # Check health
        Write-Status "Checking service health..."
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Services are healthy"
            } else {
                Write-Warning "Health check failed, but deployment may still be successful"
            }
        }
        catch {
            Write-Warning "Health check failed, but deployment may still be successful"
        }
        
        return $true
    }
    catch {
        Write-Error "Failed to deploy with Docker Compose: $_"
        return $false
    }
}

# Deploy to Vercel
function Deploy-ToVercel {
    Write-Status "Deploying to Vercel..."
    
    try {
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            vercel --prod
            Write-Success "Deployed to Vercel successfully"
            return $true
        } else {
            Write-Warning "Vercel CLI not found. Please install it or deploy manually."
            return $false
        }
    }
    catch {
        Write-Error "Failed to deploy to Vercel: $_"
        return $false
    }
}

# Deploy to Docker Hub
function Deploy-ToDockerHub {
    Write-Status "Deploying to Docker Hub..."
    
    try {
        if ($env:DOCKER_USERNAME -and $env:DOCKER_PASSWORD) {
            $env:DOCKER_PASSWORD | docker login -u $env:DOCKER_USERNAME --password-stdin
            
            # Tag and push images
            $commitHash = git rev-parse --short HEAD
            docker tag flowin/admin-panel:latest "$env:DOCKER_USERNAME/flowin-admin-panel:latest"
            docker tag flowin/admin-panel:latest "$env:DOCKER_USERNAME/flowin-admin-panel:$commitHash"
            
            docker push "$env:DOCKER_USERNAME/flowin-admin-panel:latest"
            docker push "$env:DOCKER_USERNAME/flowin-admin-panel:$commitHash"
            
            Write-Success "Deployed to Docker Hub successfully"
            return $true
        } else {
            Write-Warning "Docker Hub credentials not found. Skipping Docker Hub deployment."
            return $false
        }
    }
    catch {
        Write-Error "Failed to deploy to Docker Hub: $_"
        return $false
    }
}

# Run tests
function Start-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping tests as requested"
        return $true
    }
    
    Write-Status "Running tests..."
    
    try {
        if (Test-Path "package.json") {
            npm test
            Write-Success "Tests passed"
            return $true
        } else {
            Write-Warning "No package.json found. Skipping tests."
            return $true
        }
    }
    catch {
        Write-Error "Tests failed: $_"
        return $false
    }
}

# Main deployment function
function Main {
    Write-Host "==========================================" -ForegroundColor $Blue
    Write-Host "  Flowin Admin Panel Deployment" -ForegroundColor $Blue
    Write-Host "==========================================" -ForegroundColor $Blue
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Docker)) {
        exit 1
    }
    
    if (-not (Test-DockerCompose)) {
        exit 1
    }
    
    # Run tests
    if (-not (Start-Tests)) {
        Write-Error "Tests failed. Deployment aborted."
        exit 1
    }
    
    # Build images
    if (-not (Build-Images)) {
        Write-Error "Failed to build images. Deployment aborted."
        exit 1
    }
    
    # Deploy based on target
    $deploymentSuccess = $false
    
    switch ($Target.ToLower()) {
        "docker" {
            $deploymentSuccess = Deploy-WithCompose
        }
        "vercel" {
            $deploymentSuccess = Deploy-ToVercel
        }
        "dockerhub" {
            $deploymentSuccess = Deploy-ToDockerHub
        }
        "all" {
            $dockerSuccess = Deploy-WithCompose
            $vercelSuccess = Deploy-ToVercel
            $dockerHubSuccess = Deploy-ToDockerHub
            $deploymentSuccess = $dockerSuccess -or $vercelSuccess -or $dockerHubSuccess
        }
        default {
            Write-Error "Unknown deployment target: $Target"
            Write-Status "Available targets: docker, vercel, dockerhub, all"
            exit 1
        }
    }
    
    if ($deploymentSuccess) {
        Write-Success "Deployment completed successfully!"
        Write-Host ""
        Write-Host "🌐 Access your application:" -ForegroundColor $Blue
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor $White
        Write-Host "   Backend: http://localhost:3001" -ForegroundColor $White
        Write-Host "   Grafana: http://localhost:3001:3000" -ForegroundColor $White
        Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor $White
        Write-Host ""
        Write-Host "📊 Monitoring:" -ForegroundColor $Blue
        Write-Host "   Health Check: http://localhost/health" -ForegroundColor $White
        Write-Host "   Metrics: http://localhost/api/metrics" -ForegroundColor $White
        Write-Host ""
        Write-Host "🔧 Management:" -ForegroundColor $Blue
        Write-Host "   View logs: docker-compose logs -f" -ForegroundColor $White
        Write-Host "   Stop services: docker-compose down" -ForegroundColor $White
        Write-Host "   Restart services: docker-compose restart" -ForegroundColor $White
        Write-Host ""
        Write-Host "Happy deployment! 🚀" -ForegroundColor $Green
    } else {
        Write-Error "Deployment failed!"
        exit 1
    }
}

# Run main function
Main

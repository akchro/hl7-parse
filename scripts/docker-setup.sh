#!/bin/bash

# HL7 LiteBoard Docker Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "backend/uploads"
        "backend/logs"
        "nginx/ssl"
        "database/backups"
        "monitoring/rules"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done
    
    print_success "All directories created"
}

# Copy environment file
setup_environment() {
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your production values"
    else
        print_status ".env file already exists"
    fi
}

# Build and start services
start_services() {
    local environment="$1"
    
    case $environment in
        "dev"|"development")
            print_status "Starting development environment..."
            docker-compose -f docker-compose.dev.yml up -d --build
            ;;
        "prod"|"production")
            print_status "Starting production environment..."
            docker-compose -f docker-compose.prod.yml up -d --build
            ;;
        "monitoring")
            print_status "Starting with monitoring stack..."
            docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d --build
            ;;
        *)
            print_status "Starting default environment..."
            docker-compose up -d --build
            ;;
    esac
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    services=("postgres" "backend" "frontend")
    
    for service in "${services[@]}"; do
        print_status "Checking $service..."
        timeout=60
        while [ $timeout -gt 0 ]; do
            if docker-compose ps | grep -q "$service.*healthy\|$service.*Up"; then
                print_success "$service is ready"
                break
            fi
            sleep 2
            timeout=$((timeout-2))
        done
        
        if [ $timeout -le 0 ]; then
            print_warning "$service may not be ready yet"
        fi
    done
}

# Display service URLs
show_urls() {
    print_success "HL7 LiteBoard is running!"
    echo ""
    echo "Service URLs:"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost:3001"
    echo "  Database: localhost:5432"
    echo ""
    
    if docker-compose ps | grep -q "pgadmin"; then
        echo "Development Tools:"
        echo "  pgAdmin: http://localhost:8080"
        echo "  Mailhog: http://localhost:8025"
        echo ""
    fi
    
    if docker-compose ps | grep -q "grafana"; then
        echo "Monitoring:"
        echo "  Grafana: http://localhost:3000"
        echo "  Prometheus: http://localhost:9090"
        echo ""
    fi
}

# Main script
main() {
    local environment="${1:-default}"
    
    print_status "Setting up HL7 LiteBoard Docker environment..."
    
    check_docker
    create_directories
    setup_environment
    start_services "$environment"
    wait_for_services
    show_urls
    
    print_success "Setup complete!"
}

# Help function
show_help() {
    echo "HL7 LiteBoard Docker Setup Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  dev, development  - Start development environment with hot reload"
    echo "  prod, production  - Start production environment with nginx"
    echo "  monitoring        - Start with full monitoring stack"
    echo "  default          - Start basic environment"
    echo ""
    echo "Examples:"
    echo "  $0 dev           - Start development environment"
    echo "  $0 prod          - Start production environment"
    echo "  $0 monitoring    - Start with monitoring"
    echo ""
}

# Check for help flag
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
#!/bin/bash

# HL7 LiteBoard Docker Startup Script
# Builds and starts the complete development environment

set -e

echo "🚀 Starting HL7 LiteBoard Development Environment"
echo "================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo -e "${BLUE}📦 Building and starting services...${NC}"

# Build and start services
docker-compose up --build -d

echo -e "${BLUE}⏳ Waiting for services to start...${NC}"

# Wait for services to be healthy
services=("postgres" "backend" "mastra-mock")
for service in "${services[@]}"; do
    echo -n "Checking $service... "
    
    # Wait up to 60 seconds for service to be healthy
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose ps | grep "$service" | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅ Ready${NC}"
            break
        fi
        sleep 2
        timeout=$((timeout-2))
        echo -n "."
    done
    
    if [ $timeout -le 0 ]; then
        echo -e "${YELLOW}⚠️  May not be ready${NC}"
    fi
done

echo -e "\n${GREEN}🎉 HL7 LiteBoard is ready!${NC}"
echo "================================================="
echo -e "${BLUE}Service URLs:${NC}"
echo "• FastAPI Backend: http://localhost:8000"
echo "• API Documentation: http://localhost:8000/docs"
echo "• ReDoc: http://localhost:8000/redoc"
echo "• pgAdmin: http://localhost:8080"
echo "• Mock Mastra Service: http://localhost:3001"

echo -e "\n${BLUE}Credentials:${NC}"
echo "• pgAdmin: admin@hl7liteboard.com / admin123"
echo "• Database: hl7user / hl7password"

echo -e "\n${BLUE}Quick Test:${NC}"
echo "• Run comprehensive tests: ./test-endpoints.sh"
echo "• Process sample files: curl -X POST http://localhost:8000/api/v1/samples/process-all"
echo "• View logs: docker-compose logs -f backend"

echo -e "\n${BLUE}Management Commands:${NC}"
echo "• Stop services: docker-compose down"
echo "• View logs: docker-compose logs -f [service_name]"
echo "• Restart service: docker-compose restart [service_name]"
echo "• Rebuild: docker-compose up --build -d"

echo -e "\n${YELLOW}Ready to process HL7 messages! 🏥📄${NC}"
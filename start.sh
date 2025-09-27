#!/bin/bash

# HL7 LiteBoard - Single Docker Compose Startup
# Consolidated startup script for the entire HL7 LiteBoard system

set -e

echo "🚀 Starting HL7 LiteBoard System"
echo "================================"

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

# Parse command line arguments
PROFILE=""
if [ "$1" = "--monitoring" ]; then
    PROFILE="--profile monitoring"
    echo -e "${BLUE}🔍 Starting with monitoring stack (Prometheus + Grafana)${NC}"
elif [ "$1" = "--frontend" ]; then
    PROFILE="--profile frontend"
    echo -e "${BLUE}🌐 Starting with frontend (React)${NC}"
elif [ "$1" = "--all" ]; then
    PROFILE="--profile monitoring --profile frontend"
    echo -e "${BLUE}🚀 Starting with all services (monitoring + frontend)${NC}"
fi

echo -e "${BLUE}📦 Building and starting services...${NC}"

# Build and start services
if [ -n "$PROFILE" ]; then
    docker-compose $PROFILE up --build -d
else
    docker-compose up --build -d
fi

echo -e "${BLUE}⏳ Waiting for services to start...${NC}"

# Wait for core services to be healthy
core_services=("postgres" "backend" "mastra-mock")
for service in "${core_services[@]}"; do
    echo -n "Checking $service... "
    
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
echo "================================"

echo -e "${BLUE}Core Services:${NC}"
echo "• FastAPI Backend: http://localhost:8000"
echo "• API Documentation: http://localhost:8000/docs"
echo "• pgAdmin: http://localhost:8080 (admin@hl7liteboard.com / admin123)"
echo "• Mock Mastra: http://localhost:3001"

if [[ "$PROFILE" == *"monitoring"* ]]; then
    echo -e "\n${BLUE}Monitoring Services:${NC}"
    echo "• Prometheus: http://localhost:9090"
    echo "• Grafana: http://localhost:3000 (admin / admin123)"
fi

if [[ "$PROFILE" == *"frontend"* ]]; then
    echo -e "\n${BLUE}Frontend:${NC}"
    echo "• React App: http://localhost:80"
fi

echo -e "\n${BLUE}Quick Commands:${NC}"
echo "• Test all endpoints: ./fastapi-backend/test-endpoints.sh"
echo "• Process samples: curl -X POST http://localhost:8000/api/v1/samples/process-all"
echo "• View logs: docker-compose logs -f backend"
echo "• Stop services: docker-compose down"

echo -e "\n${YELLOW}Usage Examples:${NC}"
echo "• Basic startup: ./start.sh"
echo "• With monitoring: ./start.sh --monitoring"
echo "• With frontend: ./start.sh --frontend"
echo "• Everything: ./start.sh --all"

echo -e "\n${GREEN}Ready to process HL7 messages! 🏥📄${NC}"
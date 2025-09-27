#!/bin/bash

# HL7 LiteBoard API Testing Script
# Tests all major endpoints of the FastAPI backend

set -e

API_BASE="http://localhost:8000/api/v1"
BACKEND_BASE="http://localhost:8000"

echo "🚀 Testing HL7 LiteBoard FastAPI Backend"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make HTTP requests and display results
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "\n${BLUE}Testing: ${description}${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\nSTATUS_CODE:%{http_code}")
    else
        response=$(curl -s -X "$method" "$endpoint" \
            -w "\nSTATUS_CODE:%{http_code}")
    fi
    
    # Extract status code
    status_code=$(echo "$response" | grep "STATUS_CODE:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/STATUS_CODE:/d')
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS ($status_code)${NC}"
        echo "Response: $response_body" | head -c 200
        if [ ${#response_body} -gt 200 ]; then echo "..."; fi
    else
        echo -e "${RED}❌ FAILED ($status_code)${NC}"
        echo "Response: $response_body"
    fi
}

# Function to upload a file
test_file_upload() {
    local filename=$1
    local description=$2
    
    echo -e "\n${BLUE}Testing: ${description}${NC}"
    echo "File: $filename"
    
    if [ ! -f "$filename" ]; then
        echo -e "${YELLOW}⚠️  File not found, skipping${NC}"
        return
    fi
    
    response=$(curl -s -X POST "${API_BASE}/upload/hl7" \
        -F "file=@$filename" \
        -w "\nSTATUS_CODE:%{http_code}")
    
    status_code=$(echo "$response" | grep "STATUS_CODE:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/STATUS_CODE:/d')
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS ($status_code)${NC}"
        echo "Response: $response_body"
        
        # Extract message_id for further testing
        message_id=$(echo "$response_body" | grep -o '"message_id":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$message_id" ]; then
            echo "Message ID: $message_id"
            # Store for later use
            echo "$message_id" > /tmp/last_message_id.txt
        fi
    else
        echo -e "${RED}❌ FAILED ($status_code)${NC}"
        echo "Response: $response_body"
    fi
}

echo -e "\n${YELLOW}1. Health Check${NC}"
test_endpoint "GET" "$BACKEND_BASE/health" "Backend health check"

echo -e "\n${YELLOW}2. API Root${NC}"
test_endpoint "GET" "$BACKEND_BASE/" "API root endpoint"

echo -e "\n${YELLOW}3. Sample Files${NC}"
test_endpoint "GET" "$API_BASE/samples" "List sample HL7 files"

echo -e "\n${YELLOW}4. Process Sample File${NC}"
test_endpoint "POST" "$API_BASE/samples/process" "Process sample file" \
    '{"sample_filename": "adt_admission.hl7"}'

echo -e "\n${YELLOW}5. Process All Samples${NC}"
test_endpoint "POST" "$API_BASE/samples/process-all" "Process all sample files"

echo -e "\n${YELLOW}6. Browse Messages${NC}"
test_endpoint "GET" "$API_BASE/browse/messages?page=1&page_size=5" "Browse processed messages"

echo -e "\n${YELLOW}7. Processing Stats${NC}"
test_endpoint "GET" "$API_BASE/browse/stats" "Get processing statistics"

echo -e "\n${YELLOW}8. File Upload Test${NC}"
test_file_upload "sample_files/oru_lab_results.hl7" "Upload HL7 lab results file"

echo -e "\n${YELLOW}9. Text Upload Test${NC}"
hl7_sample='MSH|^~\&|TEST|HOSPITAL|HL7LITE|DASHBOARD|20241201120000||ADT^A01^ADT_A01|TEST001|P|2.5|||NE|NE|US
PID|1||TEST123^^^HOSPITAL^MR||TESTPATIENT^JOHN^M||19900101|M||W|123 TEST ST^^TESTCITY^NY^12345^USA||(555)123-4567|||S||TEST123|999-88-7777'

test_endpoint "POST" "$API_BASE/upload/hl7/text" "Upload HL7 as text" \
    "{\"hl7_content\": \"$hl7_sample\", \"filename\": \"test_message.hl7\"}"

# Wait a bit for processing
echo -e "\n${YELLOW}⏳ Waiting 10 seconds for background processing...${NC}"
sleep 10

echo -e "\n${YELLOW}10. Check Processing Status${NC}"
if [ -f /tmp/last_message_id.txt ]; then
    message_id=$(cat /tmp/last_message_id.txt)
    test_endpoint "GET" "$API_BASE/upload/status/$message_id" "Check processing status"
else
    echo -e "${YELLOW}⚠️  No message ID available, skipping${NC}"
fi

echo -e "\n${YELLOW}11. Format Retrieval${NC}"
if [ -f /tmp/last_message_id.txt ]; then
    message_id=$(cat /tmp/last_message_id.txt)
    test_endpoint "GET" "$API_BASE/formats/$message_id" "Get all formats"
    test_endpoint "GET" "$API_BASE/formats/$message_id/xml" "Get XML format"
    test_endpoint "GET" "$API_BASE/formats/$message_id/json" "Get JSON format"
    test_endpoint "GET" "$API_BASE/formats/$message_id/pdf" "Get PDF format"
else
    echo -e "${YELLOW}⚠️  No message ID available, skipping format tests${NC}"
fi

echo -e "\n${YELLOW}12. Search Test${NC}"
test_endpoint "GET" "$API_BASE/browse/search?q=TEST&limit=5" "Search messages"

echo -e "\n${YELLOW}13. Sample File Content${NC}"
test_endpoint "GET" "$API_BASE/samples/adt_admission.hl7/content" "Get sample file content"

echo -e "\n${YELLOW}14. Mock Mastra Health Check${NC}"
test_endpoint "GET" "http://localhost:3001/health" "Mock Mastra service health"

echo -e "\n${GREEN}🎉 Testing Complete!${NC}"
echo "========================================"
echo -e "${BLUE}Access points:${NC}"
echo "• FastAPI Docs: http://localhost:8000/docs"
echo "• ReDoc: http://localhost:8000/redoc"
echo "• pgAdmin: http://localhost:8080 (admin@hl7liteboard.com / admin123)"
echo "• Mock Mastra: http://localhost:3001/health"

# Cleanup
rm -f /tmp/last_message_id.txt
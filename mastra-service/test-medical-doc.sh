#!/bin/bash

# Test script for the new HL7 Medical Document endpoints

echo "Testing HL7 Medical Document Conversion Service"
echo "================================================"

# Sample HL7 message
HL7_MESSAGE='MSH|^~\&|HIS|RIH|EKG|EKG|20210308123000||ADT^A01|MSG00001|P|2.5|||
PID|1||12345^^^HOSPITAL^MRN||DOE^JOHN^A||19700101|M|||123 MAIN ST^^ANYTOWN^CA^12345^USA||555-1234||EN|S||12345|123-45-6789|||
PV1|1|I|3B^301^01||||004777^SMITH^JANE^A|||SUR||||ADM|A0||'

# Test Plain English conversion
echo ""
echo "1. Testing Plain English conversion..."
curl -X POST http://localhost:3001/convert-hl7/plain-english \
  -H "Content-Type: application/json" \
  -d "{\"hl7Content\": \"$HL7_MESSAGE\"}" \
  | python3 -m json.tool

# Test LaTeX conversion
echo ""
echo "2. Testing LaTeX conversion..."
curl -X POST http://localhost:3001/convert-hl7/latex \
  -H "Content-Type: application/json" \
  -d "{\"hl7Content\": \"$HL7_MESSAGE\"}" \
  | python3 -m json.tool

# Test Medical Document (HTML + LaTeX) conversion
echo ""
echo "3. Testing Medical Document conversion (HTML + LaTeX)..."
curl -X POST http://localhost:3001/convert-hl7/medical-document \
  -H "Content-Type: application/json" \
  -d "{\"hl7Content\": \"$HL7_MESSAGE\", \"format\": \"both\"}" \
  | python3 -m json.tool

# Test Medical Document with PDF generation
echo ""
echo "4. Testing Medical Document with PDF generation..."
curl -X POST http://localhost:3001/convert-hl7/medical-document \
  -H "Content-Type: application/json" \
  -d "{\"hl7Content\": \"$HL7_MESSAGE\", \"generatePdf\": true, \"format\": \"html\"}" \
  | python3 -m json.tool

echo ""
echo "Tests completed!"
# HL7 Medical Document Conversion Service

This service provides an enhanced Mastra agent that converts HL7 messages into readable medical documents using Google's Gemini AI.

## Features

- **Plain English Conversion**: Converts complex HL7 messages into easily understandable medical reports
- **LaTeX Document Generation**: Creates professional medical documents in LaTeX format
- **HTML Document Generation**: Generates styled HTML medical documents
- **PDF Export**: Converts HTML documents to PDF for easy sharing and printing

## API Endpoints

### 1. Plain English Conversion
```bash
POST /convert-hl7/plain-english
```

Converts HL7 message to plain English medical report.

**Request Body:**
```json
{
  "hl7Content": "MSH|^~\\&|..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plainEnglish": "Patient Information: John Doe...",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 2. LaTeX Conversion
```bash
POST /convert-hl7/latex
```

Converts HL7 to LaTeX formatted medical document.

**Request Body:**
```json
{
  "hl7Content": "MSH|^~\\&|..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plainEnglish": "...",
    "latex": "\\documentclass{article}...",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 3. Complete Medical Document
```bash
POST /convert-hl7/medical-document
```

Generates a complete medical document with optional PDF generation.

**Request Body:**
```json
{
  "hl7Content": "MSH|^~\\&|...",
  "generatePdf": true,
  "format": "both"  // Options: "html", "latex", "both"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plainEnglish": "...",
    "html": "<!DOCTYPE html>...",
    "latex": "\\documentclass{article}...",
    "pdfBase64": "...",
    "pdfFilename": "medical-doc-1234567890.pdf",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 4. PDF Download
```bash
GET /download/pdf/:filename
```

Downloads a generated PDF file.

## Docker Setup

The service runs in a Docker container with all necessary dependencies:

```bash
# Build and run with docker-compose
docker-compose up mastra-service

# Or build standalone
docker build -f Dockerfile.light -t hl7-medical-agent ./mastra-service
docker run -p 3001:3001 -e GOOGLE_GENERATIVE_AI_API_KEY=your-key hl7-medical-agent
```

## Testing

Run the test script to verify all endpoints:

```bash
./mastra-service/test-medical-doc.sh
```

## Architecture

The service uses:
- **Google Gemini AI** for intelligent HL7 parsing and medical text generation
- **Puppeteer** for HTML to PDF conversion
- **Express.js** for the REST API server
- **TypeScript** for type-safe development

## Medical Document Features

Generated documents include:
- Patient demographics and identifiers
- Clinical data and observations
- Test results and lab values
- Medication information
- Professional formatting suitable for medical records
- Confidentiality notices
- Proper medical terminology explanations
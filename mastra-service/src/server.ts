import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HL7MedicalDocumentAgent } from './hl7-medical-agent-html.js';
import { triageAgent } from './agents/hl7-agent.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mastra-hl7-service' });
});

// HL7 conversion endpoint - both formats
app.post('/convert-hl7', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 conversion request...');

    // Create prompts for JSON and XML conversion
    const jsonPrompt = `
You are an expert HL7 (Health Level 7) message processor. Convert the following HL7 message to clean, structured JSON format.

HL7 Message:
${hl7Content}

Requirements:
- Create a hierarchical JSON structure with segments as top-level objects
- Each segment should contain its fields as properties with descriptive names
- Preserve all data elements and components
- Include segment sequence numbers where applicable
- Extract key metadata like message type, version, and segments present

Return only valid JSON without any markdown formatting or additional text.
`;

    const xmlPrompt = `
You are an expert HL7 (Health Level 7) message processor. Convert the following HL7 message to well-formed XML format.

HL7 Message:
${hl7Content}

Requirements:
- Create well-formed XML with proper structure
- Use segment names as element tags
- Include field and component structure
- Add attributes for metadata when appropriate
- Ensure XML is valid and parseable
- Include XML declaration

Return only valid XML without any markdown formatting or additional text.
`;

    // Process both conversions in parallel
    const [jsonResponse, xmlResponse] = await Promise.all([
      model.generateContent(jsonPrompt),
      model.generateContent(xmlPrompt)
    ]);

    const jsonResult = jsonResponse.response.text();
    const xmlResult = xmlResponse.response.text();

    // Try to parse and validate JSON
    let jsonData;
    let jsonSuccess = true;
    let jsonError = null;

    try {
      jsonData = JSON.parse(jsonResult);
    } catch (error) {
      jsonSuccess = false;
      jsonError = 'Failed to parse generated JSON';
      jsonData = jsonResult; // Return raw text if parsing fails
    }

    console.log('HL7 conversion completed successfully');

    res.json({
      success: true,
      data: {
        jsonResult: {
          success: jsonSuccess,
          data: jsonData,
          error: jsonError,
          metadata: {
            messageType: 'Unknown', // Could extract from HL7 if needed
            version: 'Unknown',
            segments: []
          }
        },
        xmlResult: {
          success: true,
          data: xmlResult,
          error: null,
          metadata: {
            messageType: 'Unknown',
            version: 'Unknown', 
            segments: []
          }
        }
      }
    });
  } catch (error) {
    console.error('Error processing HL7 conversion:', error);
    res.status(500).json({
      error: 'Internal server error during HL7 conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// JSON-only conversion endpoint
app.post('/convert-hl7/json', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to JSON conversion...');

    const prompt = `
You are an expert HL7 (Health Level 7) message processor. Convert the following HL7 message to clean, structured JSON format.

HL7 Message:
${hl7Content}

Requirements:
- Create a hierarchical JSON structure with segments as top-level objects
- Each segment should contain its fields as properties with descriptive names
- Preserve all data elements and components
- Include segment sequence numbers where applicable
- Extract key metadata like message type, version, and segments present

Return only valid JSON without any markdown formatting or additional text.
`;

    const response = await model.generateContent(prompt);
    const result = response.response.text();

    // Try to parse and validate JSON
    let jsonData;
    let success = true;
    let error = null;

    try {
      jsonData = JSON.parse(result);
    } catch (parseError) {
      success = false;
      error = 'Failed to parse generated JSON';
      jsonData = result; // Return raw text if parsing fails
    }

    res.json({
      success,
      data: jsonData,
      error,
      metadata: {
        messageType: 'Unknown',
        version: 'Unknown',
        segments: []
      }
    });
  } catch (error) {
    console.error('Error processing HL7 to JSON conversion:', error);
    res.status(500).json({
      error: 'Internal server error during JSON conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// XML-only conversion endpoint
app.post('/convert-hl7/xml', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to XML conversion...');

    const prompt = `
You are an expert HL7 (Health Level 7) message processor. Convert the following HL7 message to well-formed XML format.

HL7 Message:
${hl7Content}

Requirements:
- Create well-formed XML with proper structure
- Use segment names as element tags
- Include field and component structure
- Add attributes for metadata when appropriate
- Ensure XML is valid and parseable
- Include XML declaration

Return only valid XML without any markdown formatting or additional text.
`;

    const response = await model.generateContent(prompt);
    const result = response.response.text();

    res.json({
      success: true,
      data: result,
      error: null,
      metadata: {
        messageType: 'Unknown',
        version: 'Unknown',
        segments: []
      }
    });
  } catch (error) {
    console.error('Error processing HL7 to XML conversion:', error);
    res.status(500).json({
      error: 'Internal server error during XML conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Initialize Medical Document Agent
const medicalAgent = new HL7MedicalDocumentAgent(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// Create output directory for PDFs if it doesn't exist
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// HL7 to Plain English endpoint
app.post('/convert-hl7/plain-english', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to Plain English conversion...');
    const plainEnglish = await medicalAgent.convertToPlainEnglish(hl7Content);

    res.json({
      success: true,
      data: {
        plainEnglish,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing HL7 to Plain English:', error);
    res.status(500).json({
      error: 'Internal server error during Plain English conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// HL7 to LaTeX endpoint
app.post('/convert-hl7/latex', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to LaTeX conversion...');
    const plainEnglish = await medicalAgent.convertToPlainEnglish(hl7Content);
    const latexContent = await medicalAgent.convertToLatex(plainEnglish, hl7Content);

    res.json({
      success: true,
      data: {
        plainEnglish,
        latex: latexContent,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing HL7 to LaTeX:', error);
    res.status(500).json({
      error: 'Internal server error during LaTeX conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// HL7 to Medical Document (PDF) endpoint
app.post('/convert-hl7/medical-document', async (req, res) => {
  try {
    const { hl7Content, generatePdf = false, format = 'both' } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to Medical Document...');
    
    // Generate unique filename for PDF if requested
    const timestamp = Date.now();
    const pdfFilename = generatePdf ? `medical-doc-${timestamp}.pdf` : undefined;
    const pdfPath = pdfFilename ? path.join(outputDir, pdfFilename) : undefined;

    const result = await medicalAgent.processHL7ToMedicalDocument(
      hl7Content,
      pdfPath,
      format
    );

    // If PDF was generated, send it as base64
    let pdfBase64: string | undefined;
    if (result.pdfBuffer) {
      pdfBase64 = result.pdfBuffer.toString('base64');
    }

    res.json({
      success: true,
      data: {
        plainEnglish: result.plainEnglish,
        html: result.html,
        latex: result.latex,
        pdfBase64,
        pdfFilename,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing HL7 to Medical Document:', error);
    res.status(500).json({
      error: 'Internal server error during Medical Document generation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Endpoint to download generated PDF files
app.get('/download/pdf/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(outputDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'File not found'
    });
  }

  res.download(filePath, filename);
});

// Medical Triage Analysis endpoint
app.post('/triage-analysis', async (req, res) => {
  try {
    const { hl7Messages, hl7_messages, patientCount, patient_count } = req.body;
    const messages = hl7Messages || hl7_messages;
    const count = patientCount || patient_count;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'hl7Messages array is required in request body',
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: 'At least one HL7 message is required for triage analysis',
      });
    }

    console.log(`Processing triage analysis for ${messages.length} patients...`);

    // Create a comprehensive prompt for triage analysis
    const triagePrompt = `
Analyze the following HL7 messages for medical triage purposes. For each patient, provide a severity score (1-100) based on clinical urgency and standardized triage protocols.

HL7 Messages to analyze:
${messages.map((hl7, index) => `
--- Patient ${index + 1} ---
${hl7}
`).join('\n')}

For each patient, analyze:
1. Vital signs and clinical indicators
2. Chief complaints and symptoms
3. Medical history and comorbidities
4. Age and demographic factors
5. Urgency of care needed

Provide your assessment in the following JSON format:
{
  "results": [
    {
      "patient_id": "extracted_patient_id",
      "patient_name": "extracted_patient_name",
      "severity_score": 85,
      "priority_level": "Emergent",
      "clinical_summary": "Brief summary of patient condition",
      "key_findings": ["finding1", "finding2"],
      "recommended_timeline": "Immediate/Within 15 minutes/Within 1 hour/Within 2-4 hours/Routine",
      "reasoning": "Clinical reasoning for the severity score"
    }
  ]
}

Remember:
- Score 90-100: Immediate/Resuscitation
- Score 80-89: Emergent  
- Score 70-79: Urgent
- Score 60-69: Less Urgent
- Score 50-59: Non-urgent
- Score 1-49: Delayed care

Return only valid JSON without markdown formatting.`;

    // Process triage analysis with Gemini
    const response = await triageAgent.run(triagePrompt);
    
    // Try to parse the JSON response
    let triageResults;
    try {
      triageResults = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse triage response:', parseError);
      // Try to extract JSON from response if it contains extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          triageResults = JSON.parse(jsonMatch[0]);
        } catch (retryError) {
          throw new Error('Invalid JSON response from triage agent');
        }
      } else {
        throw new Error('No valid JSON found in triage response');
      }
    }

    // Validate response structure
    if (!triageResults.results || !Array.isArray(triageResults.results)) {
      throw new Error('Invalid triage response structure');
    }

    // Sort results by severity score (highest first)
    triageResults.results.sort((a, b) => b.severity_score - a.severity_score);

    res.json({
      success: true,
      data: triageResults.results,
      metadata: {
        patientsAnalyzed: triageResults.results.length,
        timestamp: new Date().toISOString(),
        triageProtocols: ['ESI', 'CTAS', 'MTS']
      }
    });

  } catch (error) {
    console.error('Error processing triage analysis:', error);
    res.status(500).json({
      error: 'Internal server error during triage analysis',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mastra HL7 Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`HL7 Conversion: http://localhost:${PORT}/convert-hl7`);
  console.log(`HL7 to Plain English: http://localhost:${PORT}/convert-hl7/plain-english`);
  console.log(`HL7 to LaTeX: http://localhost:${PORT}/convert-hl7/latex`);
  console.log(`HL7 to Medical Document: http://localhost:${PORT}/convert-hl7/medical-document`);
  console.log(`Medical Triage Analysis: http://localhost:${PORT}/triage-analysis`);
});

export default app;
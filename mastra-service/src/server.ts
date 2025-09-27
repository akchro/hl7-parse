import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Start server
app.listen(PORT, () => {
  console.log(`Mastra HL7 Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`HL7 Conversion: http://localhost:${PORT}/convert-hl7`);
});

export default app;
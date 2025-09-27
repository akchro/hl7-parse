import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mastraConfig from './mastra-config.js';
import { agents } from './agents/hl7-agent.js';
import hl7ProcessingWorkflow from './workflows/hl7-processing-workflow.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'mastra-hl7-service',
    framework: 'mastra',
    agents: Object.keys(agents).length,
    workflows: 1
  });
});

// Main HL7 processing endpoint using Mastra workflow
app.post('/convert-hl7', async (req, res) => {
  try {
    const { hl7Content, outputFormats = ['json', 'xml'], generatePdf = false, validateFirst = true } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 with Mastra workflow...');

    // Execute the Mastra workflow
    const result = await hl7ProcessingWorkflow.execute({
      hl7Content,
      outputFormats,
      generatePdf,
      validateFirst
    });

    console.log('Mastra workflow completed successfully');

    // Format response to match existing API
    const response = {
      success: result.success,
      data: {
        jsonResult: result.json ? {
          success: true,
          data: result.json,
          error: null,
          metadata: result.metadata
        } : undefined,
        xmlResult: result.xml ? {
          success: true,
          data: result.xml,
          error: null,
          metadata: result.metadata
        } : undefined,
        plainEnglishResult: result.plainEnglish ? {
          success: true,
          data: result.plainEnglish,
          timestamp: result.metadata.processedAt
        } : undefined,
        patientInfo: result.patientInfo,
        validation: result.validation,
        metadata: result.metadata
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in Mastra HL7 processing:', error);
    res.status(500).json({
      error: 'Internal server error during HL7 processing',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// JSON-only conversion using Mastra agent
app.post('/convert-hl7/json', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to JSON with Mastra agent...');

    // Use the JSON converter agent
    const result = await agents.jsonConverterAgent.run(
      `Convert this HL7 message to clean, structured JSON format:

${hl7Content}

Requirements:
- Create a hierarchical JSON structure with segments as top-level objects
- Each segment should contain its fields as properties with descriptive names
- Preserve all data elements and components
- Include segment sequence numbers where applicable
- Extract key metadata like message type, version, and segments present

Return only valid JSON without any markdown formatting or additional text.`,
      { 
        tools: ['parse-hl7-segments', 'extract-patient-info'],
        context: { endpoint: 'json-only' }
      }
    );

    let jsonData;
    let success = true;
    let error = null;

    try {
      jsonData = typeof result === 'string' ? JSON.parse(result) : result;
    } catch (parseError) {
      success = false;
      error = 'Failed to parse generated JSON';
      jsonData = result;
    }

    res.json({
      success,
      data: jsonData,
      error,
      metadata: {
        messageType: 'Unknown',
        version: 'Unknown',
        segments: [],
        processedBy: 'Mastra JSON Agent'
      }
    });
  } catch (error) {
    console.error('Error in Mastra JSON conversion:', error);
    res.status(500).json({
      error: 'Internal server error during JSON conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// XML-only conversion using Mastra agent
app.post('/convert-hl7/xml', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to XML with Mastra agent...');

    // Use the XML converter agent
    const result = await agents.xmlConverterAgent.run(
      `Convert this HL7 message to well-formed XML format:

${hl7Content}

Requirements:
- Create well-formed XML with proper structure
- Use segment names as element tags
- Include field and component structure
- Add attributes for metadata when appropriate
- Ensure XML is valid and parseable
- Include XML declaration

Return only valid XML without any markdown formatting or additional text.`,
      { 
        tools: ['parse-hl7-segments'],
        context: { endpoint: 'xml-only' }
      }
    );

    res.json({
      success: true,
      data: result,
      error: null,
      metadata: {
        messageType: 'Unknown',
        version: 'Unknown',
        segments: [],
        processedBy: 'Mastra XML Agent'
      }
    });
  } catch (error) {
    console.error('Error in Mastra XML conversion:', error);
    res.status(500).json({
      error: 'Internal server error during XML conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Plain English conversion using Mastra agent
app.post('/convert-hl7/plain-english', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to Plain English with Mastra agent...');

    // Use the medical report agent
    const plainEnglish = await agents.medicalReportAgent.run(
      `Convert this HL7 message to a clear, professional medical report in plain English:

${hl7Content}

Create a comprehensive medical report that includes:
- Patient demographics
- Visit/encounter information  
- Clinical data and findings
- Any alerts or important notes
- Proper medical terminology

Format as a professional medical document.`,
      { 
        tools: ['parse-hl7-segments', 'extract-patient-info'],
        context: { endpoint: 'plain-english' }
      }
    );

    res.json({
      success: true,
      data: {
        plainEnglish,
        timestamp: new Date().toISOString(),
        processedBy: 'Mastra Medical Report Agent'
      }
    });
  } catch (error) {
    console.error('Error in Mastra Plain English conversion:', error);
    res.status(500).json({
      error: 'Internal server error during Plain English conversion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Medical document endpoint with workflow
app.post('/convert-hl7/medical-document', async (req, res) => {
  try {
    const { hl7Content, generatePdf = false, format = 'both' } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to Medical Document with Mastra workflow...');
    
    // Determine output formats based on request
    const outputFormats: ('json' | 'xml' | 'plainEnglish' | 'medical-report')[] = [];
    if (format === 'both' || format === 'plainEnglish') {
      outputFormats.push('plainEnglish');
    }
    if (format === 'both' || format === 'medical-report') {
      outputFormats.push('medical-report');
    }

    // Execute workflow for medical document generation
    const result = await hl7ProcessingWorkflow.execute({
      hl7Content,
      outputFormats,
      generatePdf,
      validateFirst: true
    });

    // For now, we don't generate actual PDFs - that would need additional tools
    const response = {
      success: result.success,
      data: {
        plainEnglish: result.plainEnglish,
        html: result.plainEnglish ? `<html><body><pre>${result.plainEnglish}</pre></body></html>` : undefined,
        latex: undefined, // Would need LaTeX generation tool
        pdfBase64: generatePdf ? 'bW9jayBwZGYgY29udGVudA==' : undefined,
        pdfFilename: generatePdf ? `medical-doc-${Date.now()}.pdf` : undefined,
        timestamp: result.metadata.processedAt,
        processedBy: 'Mastra Workflow'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in Mastra Medical Document generation:', error);
    res.status(500).json({
      error: 'Internal server error during Medical Document generation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Agent status endpoint
app.get('/agents/status', async (req, res) => {
  try {
    const agentStatuses: Record<string, any> = {};
    
    for (const [name, agent] of Object.entries(agents)) {
      agentStatuses[name] = {
        name: agent.name,
        status: 'active',
        model: 'gemini-flash-lite-latest',
        toolsCount: agent.tools ? agent.tools.length : 0
      };
    }

    res.json({
      success: true,
      agents: agentStatuses,
      totalAgents: Object.keys(agents).length,
      framework: 'Mastra'
    });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({
      error: 'Internal server error getting agent status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Workflow status endpoint
app.get('/workflows/status', (req, res) => {
  res.json({
    success: true,
    workflows: {
      'hl7-processing': {
        name: hl7ProcessingWorkflow.name,
        description: hl7ProcessingWorkflow.description,
        steps: 6,
        status: 'active'
      }
    },
    totalWorkflows: 1,
    framework: 'Mastra'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mastra HL7 Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 HL7 Conversion: http://localhost:${PORT}/convert-hl7`);
  console.log(`📝 Plain English: http://localhost:${PORT}/convert-hl7/plain-english`);
  console.log(`📋 Medical Document: http://localhost:${PORT}/convert-hl7/medical-document`);
  console.log(`🤖 Agent Status: http://localhost:${PORT}/agents/status`);
  console.log(`⚡ Workflow Status: http://localhost:${PORT}/workflows/status`);
  console.log(`🧠 Framework: Mastra AI`);
});

export default app;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mastra, agents, workflows } from './mastra/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create output directory for PDFs if it doesn't exist
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mastra-hl7-service',
    framework: 'Mastra Framework',
    agents: Object.keys(agents).length,
    workflows: Object.keys(workflows).length,
    tools: 5, // mastra.tools?.length || 5,
    version: '2.0.0',
  });
});

// Get Mastra system information
app.get('/mastra/info', (req, res) => {
  res.json({
    name: 'HL7 Processing System', // mastra.name,
    agents: Object.keys(agents).map(key => ({
      name: key,
      displayName: key, // agents[key as keyof typeof agents].name,
    })),
    workflows: Object.keys(workflows).map(key => ({
      name: key,
      displayName: key, // workflows[key as keyof typeof workflows].name,
    })),
    tools: [], /* mastra.tools?.map(tool => ({
      id: tool.id,
      description: tool.description,
    })) */
  });
});

// Main HL7 processing endpoint using Mastra workflows
app.post('/convert-hl7', async (req, res) => {
  try {
    const { hl7Content, outputFormats = ['json'], validateFirst = true } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 with Mastra workflow...');

    // Workflows are being reimplemented - use agents directly
    const agent = agents.hl7ProcessingAgent;
    const result = await agent.generate(
      `Process this HL7 message: ${hl7Content}`,
      {}
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processedBy: 'Mastra Framework',
    });
  } catch (error) {
    console.error('Error processing HL7:', error);
    res.status(500).json({
      error: 'Failed to process HL7 message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// HL7 validation endpoint
app.post('/convert-hl7/validate', async (req, res) => {
  try {
    const { hl7Content, strict = false } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Validating HL7 with Mastra workflow...');

    // Use validation agent directly
    const agent = agents.validationAgent;
    const result = await agent.generate(
      `Validate this HL7 message with ${strict ? 'strict' : 'standard'} validation: ${hl7Content}`,
      {}
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processedBy: 'Mastra Validation Agent',
    });
  } catch (error) {
    console.error('Error validating HL7:', error);
    res.status(500).json({
      error: 'Failed to validate HL7 message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// HL7 to JSON endpoint using Mastra agent
app.post('/convert-hl7/json', async (req, res) => {
  try {
    const { hl7Content } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Converting HL7 to JSON with Mastra agent...');

    const result = await agents.jsonConverterAgent.generate(
      `Convert this HL7 message to structured JSON format: ${hl7Content}`,
      {} // Tools are already configured in the agent
    );

    res.json({
      success: true,
      data: {
        json: result,
      },
      timestamp: new Date().toISOString(),
      processedBy: 'Mastra JSON Converter Agent',
    });
  } catch (error) {
    console.error('Error converting HL7 to JSON:', error);
    res.status(500).json({
      error: 'Failed to convert HL7 to JSON',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// HL7 to Medical Document endpoint using Mastra workflow
app.post('/convert-hl7/medical-document', async (req, res) => {
  try {
    const { hl7Content, generatePdf = false } = req.body;

    if (!hl7Content) {
      return res.status(400).json({
        error: 'hl7Content is required in request body',
      });
    }

    console.log('Processing HL7 to Medical Document with Mastra workflow...');

    // Generate unique filename for PDF if requested
    const timestamp = Date.now();
    const pdfFilename = generatePdf ? `medical-doc-${timestamp}.pdf` : undefined;
    const pdfPath = pdfFilename ? path.join(outputDir, pdfFilename) : undefined;

    // Use medical report agent directly
    const agent = agents.medicalReportAgent;
    const result = await agent.generate(
      `Generate a comprehensive medical document from this HL7 message: ${hl7Content}`,
      {}
    );

    // If PDF was requested, we need to extract the base64 data from the result
    let pdfBase64: string | undefined;
    if (generatePdf && result && typeof result === 'object') {
      // The PDF generation agent should have returned base64 data
      // We'll need to parse this from the agent response
      const resultStr = JSON.stringify(result);
      if (resultStr.includes('pdfBuffer')) {
        // Extract PDF buffer from agent response
        try {
          const pdfMatch = resultStr.match(/"pdfBuffer":"([^"]+)"/);
          if (pdfMatch) {
            pdfBase64 = pdfMatch[1];
          }
        } catch (e) {
          console.warn('Could not extract PDF from agent response');
        }
      }
    }

    res.json({
      success: true,
      data: {
        plainEnglish: result,
        html: `<html><body><pre>${JSON.stringify(result, null, 2)}</pre></body></html>`,
        pdfBase64,
        pdfFilename,
        timestamp: new Date().toISOString(),
        processedBy: 'Mastra Medical Document Workflow',
      },
    });
  } catch (error) {
    console.error('Error processing HL7 to Medical Document:', error);
    res.status(500).json({
      error: 'Failed to process HL7 to Medical Document',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Agent execution endpoint
app.post('/agents/:agentName/execute', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { prompt, tools: requestedTools } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'prompt is required in request body',
      });
    }

    const agent = agents[agentName as keyof typeof agents];
    if (!agent) {
      return res.status(404).json({
        error: `Agent '${agentName}' not found`,
        availableAgents: Object.keys(agents),
      });
    }

    console.log(`Executing agent: ${agentName}`);

    const result = await agent.generate(prompt, {
      // tools: requestedTools, // Tools parameter removed in new API
    });

    res.json({
      success: true,
      data: result,
      agent: agentName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error executing agent ${req.params.agentName}:`, error);
    res.status(500).json({
      error: `Failed to execute agent ${req.params.agentName}`,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Workflow execution endpoint
app.post('/workflows/:workflowName/execute', async (req, res) => {
  try {
    const { workflowName } = req.params;
    const triggerData = req.body;

    // Workflows are being reimplemented
    return res.status(503).json({
      error: 'Workflows are currently being reimplemented',
      message: 'Please use the agent endpoints instead',
      availableAgents: Object.keys(agents),
    });

    // const workflow = workflows[workflowName as keyof typeof workflows];
    // const result = await workflow.execute(triggerData);

    // This code is unreachable due to early return above
    // res.json({
    //   success: true,
    //   data: result,
    //   workflow: workflowName,
    //   timestamp: new Date().toISOString(),
    // });
  } catch (error) {
    console.error(`Error executing workflow ${req.params.workflowName}:`, error);
    res.status(500).json({
      error: `Failed to execute workflow ${req.params.workflowName}`,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Endpoint to download generated PDF files
app.get('/download/pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mastra HL7 Service (Real Framework) running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Mastra info: http://localhost:${PORT}/mastra/info`);
  console.log(`🔄 HL7 Conversion: http://localhost:${PORT}/convert-hl7`);
  console.log(`✅ HL7 Validation: http://localhost:${PORT}/convert-hl7/validate`);
  console.log(`📝 JSON Conversion: http://localhost:${PORT}/convert-hl7/json`);
  console.log(`📋 Medical Document: http://localhost:${PORT}/convert-hl7/medical-document`);
  console.log(`🤖 Agents: http://localhost:${PORT}/agents/:agentName/execute`);
  console.log(`⚡ Workflows: http://localhost:${PORT}/workflows/:workflowName/execute`);
  console.log(`🧠 Framework: Real Mastra Framework v2.0`);
});
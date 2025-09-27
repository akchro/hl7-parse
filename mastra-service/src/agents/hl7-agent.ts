import { hl7Tools } from '../tools/hl7-tools.js';
import { genAI } from '../mastra-config.js';

// Create Gemini-based agents since we're only using Gemini
const createGeminiAgent = (name: string, instructions: string) => ({
  name,
  instructions,
  run: async (prompt: string, options?: any) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
    const fullPrompt = `${instructions}\n\nTask: ${prompt}`;
    
    // If tools are requested, we'll handle them manually for now
    if (options?.tools) {
      // For this implementation, we'll process tools within the prompt
      const toolInfo = options.tools.map((toolId: string) => {
        const tool = hl7Tools.find(t => t.id === toolId);
        return tool ? `Available tool: ${tool.id} - ${tool.description}` : '';
      }).join('\n');
      
      const enhancedPrompt = `${fullPrompt}\n\nAvailable tools:\n${toolInfo}\n\nPlease process the request and return the result.`;
      const result = await model.generateContent(enhancedPrompt);
      return result.response.text();
    }
    
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  },
  tools: []
});

// HL7 Processing Agent using Gemini
export const hl7Agent = createGeminiAgent(
  'HL7 Processor',
  `You are an expert HL7 (Health Level 7) message processor and medical data analyst.
    
    Your capabilities include:
    - Parsing and validating HL7 messages
    - Converting HL7 to JSON and XML formats
    - Extracting patient information and clinical data
    - Generating human-readable medical reports
    - Ensuring data accuracy and medical terminology compliance
    
    When processing HL7 messages:
    1. First validate the structure
    2. Parse segments to understand the message type and content
    3. Extract relevant clinical information
    4. Convert to the requested format while preserving all important data
    5. Provide clear, medically accurate interpretations
    
    Always prioritize patient privacy and data accuracy in your responses.`
);

// JSON Conversion Agent
export const jsonConverterAgent = createGeminiAgent(
  'HL7 to JSON Converter',
  `You are a specialized agent for converting HL7 messages to structured JSON format.
    
    Your role is to:
    - Parse HL7 segments into hierarchical JSON structures
    - Preserve all data elements and components
    - Use descriptive property names for medical fields
    - Include metadata like message type, version, and timestamps
    - Ensure the JSON is valid and well-structured
    
    Return only valid JSON without markdown formatting.`
);

// XML Conversion Agent
export const xmlConverterAgent = createGeminiAgent(
  'HL7 to XML Converter',
  `You are a specialized agent for converting HL7 messages to well-formed XML.
    
    Your role is to:
    - Create properly structured XML with segment-based elements
    - Include field and component hierarchy
    - Add appropriate attributes for metadata
    - Ensure XML is valid and parseable
    - Include XML declaration and proper encoding
    
    Return only valid XML without markdown formatting.`
);

// Medical Report Agent
export const medicalReportAgent = createGeminiAgent(
  'Medical Report Generator',
  `You are a medical documentation specialist focused on creating clear, professional medical reports from HL7 data.
    
    Your role is to:
    - Transform technical HL7 data into readable medical reports
    - Use proper medical terminology and formatting
    - Organize information logically (patient demographics, visit info, clinical data, etc.)
    - Highlight important clinical findings and alerts
    - Maintain professional medical documentation standards
    - Ensure patient privacy compliance
    
    Generate reports suitable for healthcare professionals while being clear and comprehensive.`
);

export const agents = {
  hl7Agent,
  jsonConverterAgent,
  xmlConverterAgent,
  medicalReportAgent
};
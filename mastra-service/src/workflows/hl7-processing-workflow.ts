import { z } from 'zod';
import { agents } from '../agents/hl7-agent.js';
import { hl7Tools } from '../tools/hl7-tools.js';

// Input schema for the HL7 processing workflow
const HL7WorkflowInput = z.object({
  hl7Content: z.string().describe('The raw HL7 message to process'),
  outputFormats: z.array(z.enum(['json', 'xml', 'plainEnglish', 'medical-report'])).default(['json', 'xml']),
  generatePdf: z.boolean().default(false),
  validateFirst: z.boolean().default(true)
});

// Output schema for the workflow
const HL7WorkflowOutput = z.object({
  success: z.boolean(),
  validation: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string())
  }).optional(),
  json: z.any().optional(),
  xml: z.string().optional(),
  plainEnglish: z.string().optional(),
  medicalReport: z.string().optional(),
  patientInfo: z.any().optional(),
  metadata: z.object({
    messageType: z.string().optional(),
    version: z.string().optional(),
    processedAt: z.string(),
    segmentCount: z.number().optional()
  })
});

// Simple workflow implementation since we're using basic Gemini agents
export const hl7ProcessingWorkflow = {
  name: 'HL7 Message Processing',
  description: 'Complete workflow for processing HL7 messages with validation, parsing, and conversion',
  
  execute: async (input: z.infer<typeof HL7WorkflowInput>): Promise<z.infer<typeof HL7WorkflowOutput>> => {
    const context = new Map();
    
    try {
      // Step 1: Validation (optional)
      if (input.validateFirst) {
        try {
          const validationTool = hl7Tools.find(t => t.id === 'validate-hl7-structure');
          const validation = await validationTool?.execute({ hl7Message: input.hl7Content });
          context.set('validation', validation);
        } catch (error) {
          context.set('validation', {
            isValid: false,
            errors: [error instanceof Error ? error.message : 'Validation failed'],
            warnings: []
          });
        }
      }

      // Step 2: Parse segments and extract metadata  
      const parseSegmentsTool = hl7Tools.find(t => t.id === 'parse-hl7-segments');
      const segments = await parseSegmentsTool?.execute({ hl7Message: input.hl7Content });
      context.set('segments', segments);

      // Step 3: Extract patient information
      const extractPatientTool = hl7Tools.find(t => t.id === 'extract-patient-info');
      const patientInfo = await extractPatientTool?.execute({ hl7Message: input.hl7Content });
      context.set('patientInfo', patientInfo);

      // Step 4: JSON Conversion (conditional)
      let jsonResult;
      if (input.outputFormats.includes('json')) {
        jsonResult = await agents.jsonConverterAgent.run(
          `Convert this HL7 message to structured JSON format:
          
          ${input.hl7Content}
          
          Include all segments and preserve data hierarchy. Return only valid JSON without markdown formatting.`
        );
        
        // Try to parse the JSON to ensure it's valid
        try {
          jsonResult = JSON.parse(jsonResult);
        } catch {
          // If parsing fails, keep as string
        }
        
        context.set('jsonResult', jsonResult);
      }

      // Step 5: XML Conversion (conditional)
      let xmlResult;
      if (input.outputFormats.includes('xml')) {
        xmlResult = await agents.xmlConverterAgent.run(
          `Convert this HL7 message to well-formed XML format:
          
          ${input.hl7Content}
          
          Create well-formed XML with proper structure. Return only valid XML without markdown formatting.`
        );
        context.set('xmlResult', xmlResult);
      }

      // Step 6: Plain English Conversion (conditional)
      let plainEnglishResult;
      if (input.outputFormats.includes('plainEnglish') || input.outputFormats.includes('medical-report')) {
        plainEnglishResult = await agents.medicalReportAgent.run(
          `Convert this HL7 message to a clear, professional medical report:
          
          ${input.hl7Content}
          
          Create a comprehensive medical report with patient demographics, visit info, and clinical data.`
        );
        context.set('plainEnglishResult', plainEnglishResult);
      }

      // Compile results
      return {
        success: true,
        validation: context.get('validation'),
        json: jsonResult,
        xml: xmlResult,
        plainEnglish: plainEnglishResult,
        medicalReport: plainEnglishResult,
        patientInfo,
        metadata: {
          messageType: segments?.messageType,
          version: segments?.version,
          processedAt: new Date().toISOString(),
          segmentCount: segments?.segments?.length
        }
      };
    } catch (error) {
      return {
        success: false,
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Workflow failed'],
          warnings: []
        },
        metadata: {
          processedAt: new Date().toISOString()
        }
      };
    }
  }
};

export default hl7ProcessingWorkflow;
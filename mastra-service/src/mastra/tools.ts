import { createTool } from '@mastra/core';
import { z } from 'zod';
import { HL7MedicalDocumentAgent } from '../hl7-medical-agent-html.js';
import fs from 'fs';
import path from 'path';

// Tool for validating HL7 structure
export const validateHL7Tool = createTool({
  id: 'validate-hl7-structure',
  description: 'Validates HL7 message structure and segments',
  inputSchema: z.object({
    hl7Message: z.string().describe('The HL7 message to validate'),
  }),
  execute: async (context: any) => {
    const { hl7Message } = context;
    try {
      const segments = hl7Message.split('\n').filter((line: any) => line.trim());
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation
      if (!segments[0]?.startsWith('MSH')) {
        errors.push('Message must start with MSH segment');
      }

      if (segments.length < 2) {
        warnings.push('Message has very few segments');
      }

      // Validate segment structure
      segments.forEach((segment: any, index: number) => {
        if (!segment.includes('|')) {
          errors.push(`Segment ${index + 1} does not contain field separators`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        segmentCount: segments.length,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: [],
        segmentCount: 0,
      };
    }
  },
});

// Tool for converting HL7 to JSON
export const convertHL7ToJsonTool = createTool({
  id: 'convert-hl7-to-json',
  description: 'Converts HL7 message to JSON format',
  inputSchema: z.object({
    hl7Message: z.string().describe('The HL7 message to convert'),
  }),
  execute: async (context: any) => {
    const { hl7Message } = context;
    try {
      const segments = hl7Message.split('\n').filter((line: any) => line.trim());
      const jsonResult: any = {
        messageHeader: {},
        segments: [],
      };

      segments.forEach((segment: any) => {
        const fields = segment.split('|');
        const segmentType = fields[0];
        
        if (segmentType === 'MSH') {
          jsonResult.messageHeader = {
            type: 'MSH',
            fieldSeparator: '|',
            encodingCharacters: fields[1],
            sendingApplication: fields[2],
            sendingFacility: fields[3],
            receivingApplication: fields[4],
            receivingFacility: fields[5],
            timestamp: fields[6],
            messageType: fields[8],
            messageControlId: fields[9],
            processingId: fields[10],
            versionId: fields[11],
          };
        }
        
        jsonResult.segments.push({
          type: segmentType,
          fields: fields.slice(1),
        });
      });

      return jsonResult;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Conversion failed',
      };
    }
  },
});

// Tool for extracting patient information
export const extractPatientInfoTool = createTool({
  id: 'extract-patient-info',
  description: 'Extracts patient information from HL7 message',
  inputSchema: z.object({
    hl7Message: z.string().describe('The HL7 message to extract patient info from'),
  }),
  execute: async (context: any) => {
    const { hl7Message } = context;
    try {
      const segments = hl7Message.split('\n').filter((line: any) => line.trim());
      const patientInfo: any = {};

      segments.forEach((segment: any) => {
        const fields = segment.split('|');
        const segmentType = fields[0];
        
        if (segmentType === 'PID') {
          patientInfo.patientId = fields[3];
          patientInfo.name = fields[5];
          patientInfo.dateOfBirth = fields[7];
          patientInfo.gender = fields[8];
          patientInfo.address = fields[11];
        }
      });

      return patientInfo;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Extraction failed',
      };
    }
  },
});

// Tool for generating medical documents
export const generateMedicalDocumentTool = createTool({
  id: 'generate-medical-document',
  description: 'Generates a medical document from HL7 message',
  inputSchema: z.object({
    hl7Content: z.string().describe('The HL7 message content'),
    generatePdf: z.boolean().default(false).describe('Whether to generate a PDF'),
    outputPath: z.string().optional().describe('Output path for the PDF'),
  }),
  execute: async (context: any) => {
    const { hl7Content, generatePdf, outputPath } = context;
    try {
      // Initialize with Gemini API key from environment
      const apiKey = process.env.GEMINI_API_KEY || '';
      const agent = new HL7MedicalDocumentAgent(apiKey);
      
      // Convert to plain English first, then to HTML
      const plainEnglish = await agent.convertToPlainEnglish(hl7Content);
      const html = await agent.convertToHTML(plainEnglish, hl7Content);
      
      const result = { html };
      
      if (generatePdf && outputPath) {
        // Save the HTML content to a file
        const htmlPath = outputPath.replace('.pdf', '.html');
        fs.writeFileSync(htmlPath, result.html, 'utf-8');
        
        return {
          html: result.html,
          pdfPath: outputPath,
          htmlPath: htmlPath,
          message: 'Medical document generated successfully',
        };
      }

      return {
        html: result.html,
        message: 'Medical document HTML generated successfully',
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Document generation failed',
      };
    }
  },
});

// Tool for parsing HL7 segments
export const parseHL7SegmentsTool = createTool({
  id: 'parse-hl7-segments',
  description: 'Parses individual HL7 segments',
  inputSchema: z.object({
    hl7Message: z.string().describe('The HL7 message to parse'),
  }),
  execute: async (context: any) => {
    const { hl7Message } = context;
    try {
      const segments = hl7Message.split('\n').filter((line: any) => line.trim());
      const parsedSegments: any[] = [];

      segments.forEach((segment: any) => {
        const fields = segment.split('|');
        const segmentType = fields[0];
        
        parsedSegments.push({
          type: segmentType,
          fields: fields.map((field: any, index: number) => ({
            index,
            value: field,
            subfields: field.split('^'),
          })),
        });
      });

      return parsedSegments;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Parsing failed',
      };
    }
  },
});

// Export all tools as an object for Mastra compatibility
export const hl7Tools = {
  'validate-hl7-structure': validateHL7Tool,
  'convert-hl7-to-json': convertHL7ToJsonTool,
  'extract-patient-info': extractPatientInfoTool,
  'generate-medical-document': generateMedicalDocumentTool,
  'parse-hl7-segments': parseHL7SegmentsTool,
} as any;

export default hl7Tools;
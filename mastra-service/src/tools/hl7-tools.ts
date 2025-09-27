import { z } from 'zod';

// Mastra-inspired tool interface
interface MastraTool {
  id: string;
  description: string;
  inputSchema: z.ZodSchema<any>;
  outputSchema: z.ZodSchema<any>;
  execute: (input: any) => Promise<any>;
}

// Tool for parsing HL7 segments
export const parseHL7Segments: MastraTool = {
  id: 'parse-hl7-segments',
  description: 'Parse HL7 message into individual segments',
  inputSchema: z.object({
    hl7Message: z.string().describe('The raw HL7 message to parse')
  }),
  outputSchema: z.object({
    segments: z.array(z.object({
      type: z.string(),
      content: z.string(),
      fields: z.array(z.string())
    })),
    messageType: z.string().optional(),
    version: z.string().optional()
  }),
  execute: async ({ hl7Message }) => {
    const lines = hl7Message.trim().split('\n');
    const segments = [];
    let messageType = '';
    let version = '';

    for (const line of lines) {
      if (line.trim()) {
        const fields = line.split('|');
        const segmentType = fields[0];
        
        if (segmentType === 'MSH') {
          messageType = fields[8] || '';
          version = fields[11] || '';
        }
        
        segments.push({
          type: segmentType,
          content: line,
          fields: fields
        });
      }
    }

    return {
      segments,
      messageType,
      version
    };
  }
};

// Tool for validating HL7 structure
export const validateHL7Structure: MastraTool = {
  id: 'validate-hl7-structure',
  description: 'Validate the structure and format of an HL7 message',
  inputSchema: z.object({
    hl7Message: z.string().describe('The HL7 message to validate')
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    segmentCount: z.number()
  }),
  execute: async ({ hl7Message }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lines = hl7Message.trim().split('\n');
    
    // Check if message starts with MSH
    if (!lines[0]?.startsWith('MSH')) {
      errors.push('HL7 message must start with MSH segment');
    }
    
    // Check for required segments
    const segments = lines.map((line: string) => line.split('|')[0]);
    if (!segments.includes('MSH')) {
      errors.push('Missing required MSH segment');
    }
    
    // Check field separators
    lines.forEach((line: string, index: number) => {
      if (line.trim() && !line.includes('|')) {
        warnings.push(`Line ${index + 1} may be missing field separators`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      segmentCount: lines.filter((line: string) => line.trim()).length
    };
  }
};

// Tool for extracting patient information
export const extractPatientInfo: MastraTool = {
  id: 'extract-patient-info',
  description: 'Extract patient information from HL7 PID segment',
  inputSchema: z.object({
    hl7Message: z.string().describe('The HL7 message containing patient data')
  }),
  outputSchema: z.object({
    patientId: z.string().optional(),
    name: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      fullName: z.string().optional()
    }).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional()
    }).optional()
  }),
  execute: async ({ hl7Message }) => {
    const lines = hl7Message.trim().split('\n');
    const pidLine = lines.find((line: string) => line.startsWith('PID'));
    
    if (!pidLine) {
      return {};
    }
    
    const fields = pidLine.split('|');
    
    // Extract patient ID (PID.3)
    const patientId = fields[3]?.split('^')[0] || undefined;
    
    // Extract name (PID.5)
    const nameField = fields[5];
    let name = undefined;
    if (nameField) {
      const nameParts = nameField.split('^');
      name = {
        lastName: nameParts[0] || undefined,
        firstName: nameParts[1] || undefined,
        fullName: `${nameParts[1] || ''} ${nameParts[0] || ''}`.trim() || undefined
      };
    }
    
    // Extract date of birth (PID.7)
    const dateOfBirth = fields[7] || undefined;
    
    // Extract gender (PID.8)
    const gender = fields[8] || undefined;
    
    // Extract address (PID.11)
    const addressField = fields[11];
    let address = undefined;
    if (addressField) {
      const addressParts = addressField.split('^');
      address = {
        street: addressParts[0] || undefined,
        city: addressParts[2] || undefined,
        state: addressParts[3] || undefined,
        zipCode: addressParts[4] || undefined
      };
    }
    
    return {
      patientId,
      name,
      dateOfBirth,
      gender,
      address
    };
  }
};

// Export all tools
export const hl7Tools = [
  parseHL7Segments,
  validateHL7Structure,
  extractPatientInfo
];
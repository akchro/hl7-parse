import { GoogleGenerativeAI } from '@google/generative-ai';
import latex from 'node-latex';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pipelineAsync = promisify(pipeline);

export class HL7MedicalDocumentAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
  }

  async convertToPlainEnglish(hl7Content: string): Promise<string> {
    const prompt = `
You are a medical translator AI assistant. Convert the following HL7 message into clear, plain English that can be easily understood by medical professionals and patients.

HL7 Message:
${hl7Content}

Requirements:
- Write in clear, professional medical language
- Organize information in logical sections (Patient Information, Clinical Data, Test Results, etc.)
- Include all relevant dates, times, and identifiers
- Explain medical codes and abbreviations
- Format as a readable narrative report
- Include warnings or critical values if present
- Maintain medical accuracy while being accessible

Return the plain English medical report without any markdown formatting.
`;

    const response = await this.model.generateContent(prompt);
    return response.response.text();
  }

  async convertToLatex(plainEnglishContent: string, hl7Content: string): Promise<string> {
    const prompt = `
You are a medical document formatting expert. Convert the following plain English medical report into a professional LaTeX document suitable for medical records.

Plain English Report:
${plainEnglishContent}

Original HL7 Data (for reference):
${hl7Content}

Requirements:
- Create a professional medical document in LaTeX format
- Include proper document class and packages
- Add a professional header with hospital/clinic branding placeholder
- Include patient information section
- Format clinical data in appropriate sections
- Use tables for lab results and measurements
- Apply proper medical document formatting standards
- Include timestamp and document ID
- Add confidentiality notice footer
- Use appropriate fonts and spacing for medical documents

Return only the complete LaTeX document code, starting with \\documentclass and ending with \\end{document}.
`;

    const response = await this.model.generateContent(prompt);
    return response.response.text();
  }

  async generatePDF(latexContent: string, outputPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const input = latex(latexContent, {
        errorLogs: 'errors.log',
        inputs: process.cwd()
      });

      const chunks: Buffer[] = [];
      
      input.on('data', (chunk) => {
        chunks.push(chunk);
      });

      input.on('error', (err) => {
        console.error('LaTeX compilation error:', err);
        reject(err);
      });

      input.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        
        // Save to file if outputPath is provided
        if (outputPath) {
          fs.writeFileSync(outputPath, pdfBuffer);
        }
        
        resolve(pdfBuffer);
      });

      input.pipe(fs.createWriteStream(outputPath));
    });
  }

  async processHL7ToMedicalDocument(
    hl7Content: string, 
    outputPath?: string
  ): Promise<{
    plainEnglish: string;
    latex: string;
    pdfPath?: string;
    pdfBuffer?: Buffer;
  }> {
    try {
      // Step 1: Convert HL7 to Plain English
      console.log('Converting HL7 to plain English...');
      const plainEnglish = await this.convertToPlainEnglish(hl7Content);
      
      // Step 2: Convert Plain English to LaTeX
      console.log('Converting to LaTeX format...');
      const latexContent = await this.convertToLatex(plainEnglish, hl7Content);
      
      // Step 3: Generate PDF (optional)
      let pdfBuffer: Buffer | undefined;
      let pdfPath: string | undefined;
      
      if (outputPath) {
        console.log('Generating PDF document...');
        pdfBuffer = await this.generatePDF(latexContent, outputPath);
        pdfPath = outputPath;
      }
      
      return {
        plainEnglish,
        latex: latexContent,
        pdfPath,
        pdfBuffer
      };
    } catch (error) {
      console.error('Error processing HL7 to medical document:', error);
      throw error;
    }
  }
}
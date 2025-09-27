import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

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

  async convertToHTML(plainEnglishContent: string, hl7Content: string): Promise<string> {
    const prompt = `
You are a medical document formatting expert. Convert the following plain English medical report into a professional HTML document suitable for medical records.

Plain English Report:
${plainEnglishContent}

Create a complete HTML document with:
- Professional medical document styling
- Proper sections for patient info, clinical data, etc.
- Tables for lab results and measurements
- Header with document ID and timestamp
- Footer with confidentiality notice
- Clean, readable formatting

Return only the complete HTML code, starting with <!DOCTYPE html> and ending with </html>.
Include embedded CSS styles for professional appearance.
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

Create a LaTeX document with:
\\documentclass{article}
\\usepackage{[necessary packages]}

Requirements:
- Professional medical document layout
- Proper sections for patient information
- Tables for lab results
- Header/footer with document metadata
- Confidentiality notice

Return only the complete LaTeX code.
`;

    const response = await this.model.generateContent(prompt);
    return response.response.text();
  }

  async generatePDFFromHTML(htmlContent: string, outputPath: string): Promise<Buffer> {
    try {
      // Launch Puppeteer with minimal Chrome
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set content
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0' 
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        }
      });

      await browser.close();

      // Save to file if outputPath is provided
      if (outputPath) {
        fs.writeFileSync(outputPath, pdfBuffer);
      }

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async processHL7ToMedicalDocument(
    hl7Content: string, 
    outputPath?: string,
    format: 'html' | 'latex' | 'both' = 'html'
  ): Promise<{
    plainEnglish: string;
    html?: string;
    latex?: string;
    pdfPath?: string;
    pdfBuffer?: Buffer;
  }> {
    try {
      // Step 1: Convert HL7 to Plain English
      console.log('Converting HL7 to plain English...');
      const plainEnglish = await this.convertToPlainEnglish(hl7Content);
      
      let htmlContent: string | undefined;
      let latexContent: string | undefined;
      let pdfBuffer: Buffer | undefined;
      let pdfPath: string | undefined;

      // Step 2: Generate HTML and/or LaTeX based on format
      if (format === 'html' || format === 'both') {
        console.log('Converting to HTML format...');
        htmlContent = await this.convertToHTML(plainEnglish, hl7Content);
        
        // Step 3: Generate PDF from HTML if output path provided
        if (outputPath && htmlContent) {
          console.log('Generating PDF document...');
          pdfBuffer = await this.generatePDFFromHTML(htmlContent, outputPath);
          pdfPath = outputPath;
        }
      }

      if (format === 'latex' || format === 'both') {
        console.log('Converting to LaTeX format...');
        latexContent = await this.convertToLatex(plainEnglish, hl7Content);
      }
      
      return {
        plainEnglish,
        html: htmlContent,
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
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini AI with the API key from environment variables
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Simple configuration object for our Mastra-inspired setup
export const mastraConfig = {
  name: 'HL7 Processing with Mastra Architecture',
  version: '1.0.0',
  llm: {
    provider: 'google-gemini',
    model: 'gemini-flash-lite-latest',
    instance: genAI
  },
  features: {
    agents: true,
    workflows: true,
    tools: true,
    validation: true
  }
};

export { genAI };
export default mastraConfig;
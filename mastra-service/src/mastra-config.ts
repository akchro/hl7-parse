import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with the provided API key
const genAI = new GoogleGenerativeAI('AIzaSyAOmh0Jegw90UjzF-nDy4c3PAIFMVE5Z6Q');

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
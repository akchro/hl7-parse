import { Mastra } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { agents } from './agents.js';
import { hl7Tools } from './tools.js';
import { workflows } from './workflows.js';

// Model configuration for different providers
export const models = {
  gemini: google('gemini-1.5-flash-latest'),
  openai: openai('gpt-4o-mini'),
};

// Initialize Mastra framework with all components
export const mastra = new Mastra({
  agents,
  // tools: hl7Tools, // Tools are assigned to agents directly
  workflows,
} as any);

export { agents, hl7Tools as tools, workflows };
export default mastra;
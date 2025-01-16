import { z } from "zod";

export type ChatbotTools = {
  [key: string]: {
    description: string;
    parameters: z.ZodType;
    execute: (...args: any[]) => Promise<string>;
  };
};

export type Chatbot = {
  route: string;
  name: string;
  image: string;
  InitialMessage: string;
  systemPrompt: string;
  tools?: ChatbotTools;
};

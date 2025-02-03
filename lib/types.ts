import { Message } from "ai";
import { z } from "zod";

export type ChatbotTools = {
  [key: string]: {
    description: string;
    parameters: z.ZodType;
    execute: (...args: any[]) => Promise<string>;
  };
};

export type Chatbot = {
  id: number;
  name: string;
  image: string;
  initialMessage?: string;
  systemPrompt: string;
  tools?: ChatbotTools;
};

export type AnalyticsData = {
  id?: number;
  response_text: string;
  er: number;
  ip: number;
  ex: number;
  empathy_score: number;
  sentiment: string;
  conversation_id: string;
  created_at?: string;
  message: Message[];
};

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

export type Conversations = {
  id: string;
  messages: Message[];
  group_id: string;
  user_email: string;
  avg_er: number;
  avg_ip: number;
  avg_ex: number;
  avg_empathy_score: number;
  dominant_sentiment: string;
  reactions: {
    msg_id: string;
    reaction: "like" | "dislike";
  }[];
  created_at: string;
};

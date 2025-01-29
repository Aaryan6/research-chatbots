import { saveChat } from "@/app/actions";
import { openai } from "@ai-sdk/openai";
import { generateId, streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id, user_email, systemPrompt, reaction } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    maxSteps: 5,
    tools: {
      suggestRepairShops: {
        description: "Get a list of repair shops",
        parameters: z.object({
          damage_type: z.string(),
        }),
        execute: async () => {
          const repairShops = [
            {
              name: "Speedy Auto Repairs",
              distance: "2.5 miles away",
              address: "123 Main Street, Springfield",
              estimatedRepairTime: "3-4 days",
              repairTypes: "damaged bumper and taillight",
            },
            {
              name: "AutoFix Garage",
              distance: "3 miles away",
              address: "456 Elm Road, Springfield",
              estimatedRepairTime: "2-3 days",
              repairTypes: "minor body repairs",
            },
            {
              name: "Rapid Car Care",
              distance: "1.8 miles away",
              address: "789 Oak Avenue, Springfield",
              estimatedRepairTime: "1-2 days",
              repairTypes: "cosmetic repairs",
            },
          ];
          return JSON.stringify(repairShops);
        },
      },
    },
    onFinish: async ({ text }) => {
      if (user_email) {
        await saveChat({
          id,
          user_email,
          messages: [
            ...messages,
            {
              id: generateId(),
              role: "assistant",
              content: text,
              reaction: "like",
            },
          ],
        });
      }
    },
  });

  return result.toDataStreamResponse();
}

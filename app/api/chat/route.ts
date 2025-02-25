import { addAnalytics, saveChat } from "@/app/actions";
import { openai } from "@ai-sdk/openai";
import { generateId, generateObject, streamText } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id, user_email, group_id, systemPrompt } = await req.json();

  // Check if the last message has attachments (images)
  const lastMessage = messages[messages.length - 1];
  const hasImageAttachments = lastMessage?.experimental_attachments?.some(
    (attachment: any) => attachment?.contentType?.startsWith("image/")
  );

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      systemPrompt +
      `
    Tools Available
    - Use 'askForfeedback' tool to request user feedback at conversation end.

    Rules
    - Don't response to Irrelevant queries.
    - When you feel the conversation is over or the user is thanking you, call the 'askForfeedback' tool to ask for feedback.
    ${
      hasImageAttachments
        ? "- If the user has uploaded images, analyze and respond to the content in the images."
        : ""
    }
    `,
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
      askForfeedback: {
        description: "Ask for feedback from the user",
        parameters: z.object({
          feedback: z.string(),
        }),
        execute: async () => {
          return "Please rate your experience";
        },
      },
    },
    onFinish: async ({ text }) => {
      const lastMessage = messages[messages.length - 1];
      const botMessage = {
        id: generateId(),
        role: "assistant",
        content: text,
      };

      if (user_email) {
        await saveChat({
          id,
          user_email,
          messages: [...messages, botMessage],
          group_id,
          updated_at: new Date().toISOString(),
        });

        const {
          er,
          ip,
          ex,
          empathy_score,
          error_rate,
          error_messages,
          sentiment,
        } = await calculateResponseAnalytics(text);
        await addAnalytics({
          response_text: text,
          er,
          ip,
          ex,
          empathy_score,
          error_rate,
          error_messages,
          sentiment,
          conversation_id: id,
          message: [lastMessage, botMessage],
        });
      }
    },
  });

  return result.toDataStreamResponse();
}

const calculateResponseAnalytics = async (response: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: `
    Act as an expert empathy and error analyzer. Analyze this chatbot response step-by-step:

**Rules**:
1. **Emotional Reactions (ER)**:  
   - 0 = No care/concern (e.g., "Submit your form.")  
   - 1 = Weak (vague comfort, e.g., "It'll be okay.")  
   - 2 = Strong (explicit emotion, e.g., "I'm sorry you're stressed.")  

2. **Interpretations (IP)**:  
   - 0 = No acknowledgment  
   - 1 = Weak (generic, e.g., "I understand.")  
   - 2 = Strong (specific, e.g., "Losing a job is devastating.")  

3. **Explorations (EX)**:  
   - 0 = No questions  
   - 1 = Weak (generic, e.g., "Need help?")  
   - 2 = Strong (specific, e.g., "Are you worried about bills?")  

4. **Error Analysis**:
   Check for the following errors (each worth 0.2 in error_rate):
   - Improper intent recognition
   - Irrelevant or off-topic response
   - Incorrect information
   - Incomplete or truncated response
   - Generic fallback messages ("I don't understand")

   For each error detected, provide a brief explanation of why it's an error.

5. **Sentiment**: Is the tone Positive, Neutral, or Negative?

**Response to score**:  
"[INSERT CHATBOT'S RESPONSE HERE]"  

**Output Format**:  
- ER: [0/1/2] + (Reason)  
- IP: [0/1/2] + (Reason)  
- EX: [0/1/2] + (Reason)  
- Total Empathy Score: [0-6]  
- Error Rate: [0-1] (Sum of detected errors * 0.2)
- Error Messages: List of specific errors found with explanations
- Sentiment: [Positive/Neutral/Negative]  `,
    schema: z.object({
      er: z.number(),
      ip: z.number(),
      ex: z.number(),
      empathy_score: z.number(),
      error_rate: z.number(),
      error_messages: z.array(z.string()),
      sentiment: z.string(),
    }),
    prompt: `Calculate the sentiment, empathy score and error rate for the following response: ${response}`,
  });
  return object;
};

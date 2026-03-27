import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function getModel(systemInstruction?: string) {
  if (!API_KEY || API_KEY.includes('your-')) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", 
    systemInstruction 
  });
}

/**
 * Main function for ALL generative AI calls in the app.
 * Sends a message to the Google Gemini API.
 */
export async function askClaude(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Calls Gemini and parses the result as JSON.
 * Strips code fences (e.g. ```json) automatically.
 */
export async function askClaudeJSON(prompt: string): Promise<any> {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from Gemini:", text);
    throw new Error("Gemini returned invalid JSON format.");
  }
}

/**
 * Calls Gemini with an image for vision capabilities.
 */
export async function askClaudeWithImage(
  prompt: string,
  imageBase64: string,
  mediaType: string
): Promise<string> {
  const model = getModel();
  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mediaType,
    },
  };
  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}

/**
 * Specialized RAG (Retrieval-Augmented Generation) call that contextually
 * includes the user's knowledge base and recent AI results.
 */
export async function askClaudeWithRAG(prompt: string, contextStrings: string[]): Promise<string> {
  const systemPrompt = `
You are the "Social Nanban Strategic Assistant" (an "Artificial AI Engine").
Your goal is to provide elite social media marketing strategy.

REAL-TIME KNOWLEDGE CONTEXT:
${contextStrings.join('\n---\n')}

RULES:
1. Always reference the provided context if relevant to the user's question.
2. If the user asks for "Real-time" info, use the context which contains the latest niche trends we've detected. 
3. Be professional, data-driven, and highly strategic.
4. Keep answers concise but insightful.
`;

  const model = getModel(systemPrompt);
  const result = await model.generateContent(prompt);
  return result.response.text();
}


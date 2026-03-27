import { GoogleGenerativeAI } from "@google/generative-ai";

export async function streamLLM(
  prompt: string,
  onChunk: (chunk: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: Error) => void,
  systemPrompt?: string
) {
  let fullText = '';

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your-gemini')) {
      throw new Error("Gemini API key is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }

    onDone(fullText);

  } catch (error) {
    console.error("Gemini Stream Error:", error);
    onError(error as Error);
  }
}

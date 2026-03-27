// frontend agent for handling typing effect and streaming
// Because we have python backend generating, we just simulate the UI streaming typing effect here

export class ContentAgent {
    constructor(onChunk, onComplete, onError) {
        this.onChunk = onChunk; // typing effect chunk
        this.onComplete = onComplete;
        this.onError = onError;
    }

    async generate(data, apiCall) {
        try {
            // First we call the backend API (blocking)
            // In a real WebSocket/SSE setup, this would stream. For HTTP, we simulate streaming of the response text.
            const result = await apiCall(data);
            
            // Simulate streaming the text part
            const fullText = result.generated_text;
            let currentText = '';
            
            for (let i = 0; i < fullText.length; i++) {
                currentText += fullText[i];
                if (this.onChunk) {
                    this.onChunk(currentText);
                }
                // small delay to simulate generation typing
                await new Promise(r => setTimeout(r, 10)); 
            }
            
            // Re-assign the streamed text back
            result.generated_text = currentText;
            
            if (this.onComplete) {
                this.onComplete(result);
            }
            
        } catch (error) {
            console.error("Agent generation failed:", error);
            if (this.onError) {
                this.onError(error.response?.data?.error || "Failed to generate content");
            }
        }
    }
}

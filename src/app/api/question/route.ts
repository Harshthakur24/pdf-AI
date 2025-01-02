import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentStore } from '@/app/lib/documentStore';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const documentContent = DocumentStore.getInstance().getContent();
    
    // Create enhanced prompt with document context
    const enhancedQuestion = `
      Context: ${documentContent}
      
      Question: ${question}
      
      Please provide a well-written answer based on the context above and recorrect the sentence and grammar if needed.
    `;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content with context
    const result = await model.generateContent(enhancedQuestion);
    const response = await result.response;
    const answer = response.text();

    return Response.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    return Response.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
} 
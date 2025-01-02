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
      You are a helpful AI assistant. Using the provided context, answer the following question:

      Context:
      ${documentContent}

      Question:
      ${question}

      Instructions:
      1. Answer directly and precisely based on the context
      2. If the answer isn't found in the context, say so clearly
      3. Use professional and clear language
      4. Correct any grammar or spelling in the response
      5. Keep the answer concise but complete
      6. If relevant, cite specific parts of the context

      Please provide your answer:
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
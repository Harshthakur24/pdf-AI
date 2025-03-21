import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentStore } from '@/app/lib/documentStore';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyDNbaE_VnpcuCSrVAnTn7vc1YaNCdO5Wkc");

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const documentContent = DocumentStore.getInstance().getContent();
    
    // Create enhanced prompt with document context
    const enhancedQuestion = `
      You are an expert research analyst and academic advisor. Your task is to provide accurate, well-reasoned answers based on the given context.

      Document Context:
      ${documentContent}

      User Question:
      ${question}

      Response Guidelines:
      1. Primary Analysis:
         - First address the question directly from the document context
         - If the answer isn't in the context, clearly state this
         - Support answers with relevant quotes or references from the document

      2. Response Quality:
         - Use clear, professional language
         - Maintain appropriate technical depth
         - Structure the response logically
         - Keep answers concise but thorough

      3. Additional Considerations:
         - For general questions outside the document scope, provide expert knowledge
         - Correct any grammatical errors in the response
         - If relevant, suggest related topics from the document
         - Maintain academic professionalism

      Please provide your expert response:
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
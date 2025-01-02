import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const enhancedQuestion = question + " please provide answer in well written manner";
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
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
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocumentStore } from '@/app/lib/documentStore';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Convert the file to text
    const pdfLoader = new PDFLoader(file);
    const pages = await pdfLoader.load();
    const textContent = pages.map(page => page.pageContent).join('\n');

    // Store the content
    DocumentStore.getInstance().setContent(textContent);

    // Get the model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate summary
    const result = await model.generateContent(`
      Please analyze the following document and provide a comprehensive summary that:
      1. Captures the main ideas and key points
      2. Is well-structured and easy to read
      3. Uses clear, professional language
      4. Is approximately 3-4 paragraphs long
      5. Maintains the original document's tone
      6. Avoids using bullet points or asterisks

      Document text:
      ${textContent}
    `);

    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
} 
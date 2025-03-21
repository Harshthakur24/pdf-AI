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

    const pdfLoader = new PDFLoader(file);
    const pages = await pdfLoader.load();
    const textContent = pages.map(page => page.pageContent).join('\n');

    // Store the content
    DocumentStore.getInstance().setContent(textContent);

    // Get the model
    const genAI = new GoogleGenerativeAI("AIzaSyDNbaE_VnpcuCSrVAnTn7vc1YaNCdO5Wkc");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate summary
    const result = await model.generateContent(`
      You are an expert document analyst. Please analyze the provided document and create a comprehensive summary following these guidelines:

      Key Requirements:
      1. Begin with a one-sentence overview of the document's main purpose
      2. Structure the summary in 3-4 well-organized paragraphs
      3. Include the most significant findings, arguments, or conclusions
      4. Maintain the document's original tone and technical level
      5. Use clear, professional language
      6. Preserve any critical data points, statistics, or metrics
      7. Highlight any notable recommendations or implications

      Format Guidelines:
      - Write in flowing paragraphs (no bullet points or lists)
      - Use transitional phrases between paragraphs
      - Keep the summary concise but thorough
      - Maintain professional academic tone

      Document for Analysis:
      ${textContent}

      Please provide your expert summary:
    `);

    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
} 
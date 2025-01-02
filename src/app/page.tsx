"use client";
import { FileUpload } from "./components/ui/file-upload";
import { PlaceholdersAndVanishInput } from "./components/ui/placeholders-and-vanish-input";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (!file.type.includes('pdf')) {
        setAnswer("Please upload a PDF file");
        return;
      }

      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setAnswer(data.summary);
      } catch (error) {
        console.error("Error uploading file:", error);
        setAnswer("Sorry, there was an error processing your PDF.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const input = form.querySelector('input') as HTMLInputElement;
      const question = input.value.trim();

      if (!question) {
        throw new Error('Please enter a question');
      }

      console.log('Sending question:', question); // Debug log

      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setAnswer(data.answer);
      input.value = ''; // Clear input after successful submission
    } catch (error) {
      console.error("Error:", error);
      setAnswer(error instanceof Error ? error.message : "Sorry, there was an error processing your question.");
    } finally {
      setIsLoading(false);
    }
  };

  const placeholders = [
    "Ask a question about your PDF...",
    "Ask about the main topics...",
    "What are the key findings?",
    "Summarize this document...",
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-12">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <h1 className="text-5xl font-bold text-center mt-6">PDF Question Answering</h1>
        <p className="text-center text-gray-600">
          Upload your PDF documents and ask questions about their content
        </p>

        <form className="space-y-4">
          <FileUpload onChange={handleFileUpload} />
        </form>

        {/* Q&A Interface */}
        <section className="space-y-4">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={() => {
              // Handle input change if needed
            }}
            onSubmit={handleQuestionSubmit}
          />

          {/* Answer Display Area */}
          <div className="min-h-[200px] p-4 rounded-lg border border-gray-300">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <p className="text-gray-500 text-center whitespace-pre-wrap">
                {answer || "Your answers will appear here"}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";
import { FileUpload } from "./components/ui/file-upload";
import { PlaceholdersAndVanishInput } from "./components/ui/placeholders-and-vanish-input";
import { useState } from "react";
import { motion } from "framer-motion";

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
      input.value = '';
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
          <div className="min-h-[200px] p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="relative w-12 h-12">
                  {/* Main spinning ring */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-gray-800" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />

                  {/* Center dot */}
                  <div className="absolute inset-[42%] rounded-full bg-blue-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thinking...
                </p>
              </div>
            ) : (
              <div className="h-full">
                {answer ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="prose dark:prose-invert prose-sm sm:prose-base max-w-none"
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {answer}
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                    <p className="text-gray-400 dark:text-gray-500">
                      Your answers will appear here
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                      Upload a PDF and ask a question to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* New Footer */}
      <footer className="w-full mt-auto pt-8 pb-4 text-center">
        <p className="text-gray-600 text-sm font-medium">
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/harsh-thakur-20877b246/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Harsh Thakur
          </a>{" "}
          for Internship Assessment.{" "}
          <a
            href="https://harsh-thakur.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center"
          >
            Check out my portfolio{" "}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </p>
      </footer>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { WelcomeMessage } from "@/components/chat/welcome-message";
import { RelatedQuestions } from "@/components/chat/related-questions";
import { TextToSpeechReader } from "@/components/chat/text-to-speech-reader";
import { LegalNewsTicker } from "@/components/chat/legal-news-ticker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportChatToPDF } from "@/lib/pdf-export";
import { generateRelatedQuestions } from "@/lib/related-questions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

type SourceMetadata = {
  source?: string;
  chunk_index?: number;
};

type CaseDetail = {
  source: string;
  chunkIndex?: number;
  summary: string;
  content: string;
  metadata?: Record<string, unknown>;
};

type PromptResponse = {
  answer: string;
  sources?: SourceMetadata[];
  cases?: CaseDetail[];
};

export default function NewChatPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PromptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const chatResponse = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: input })
      });

      if (!chatResponse.ok) {
        const errorBody = await chatResponse.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to fetch response");
      }

      const data: PromptResponse = await chatResponse.json();
      setResponse(data);
      setLastPrompt(input);
      setInput("");
    } catch (err) {
      console.error("Failed to fetch response:", err);
      setResponse(null);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting the assistant."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formattedAnswer = response?.answer
    ?.split("\n")
    .filter((line) => line.trim().length > 0);

  const handleExportPDF = () => {
    if (!response || !lastPrompt) return;

    exportChatToPDF({
      question: lastPrompt,
      answer: response.answer,
      sources: response.sources,
      timestamp: new Date()
    });
  };

  // Generate related questions when response changes
  useEffect(() => {
    if (response && lastPrompt) {
      const questions = generateRelatedQuestions(lastPrompt, response.answer);
      setRelatedQuestions(questions);
    } else {
      setRelatedQuestions([]);
    }
  }, [response, lastPrompt]);

  const handleRelatedQuestionClick = (question: string) => {
    setInput(question);
    // Auto-submit the question
    const syntheticEvent = {
      preventDefault: () => {}
    } as React.FormEvent<HTMLFormElement>;
    handleSubmit(syntheticEvent);
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <ChatHeader />
      <LegalNewsTicker />

      <div
        className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pb-4 pt-2
                scrollbar-thin scrollbar-thumb-rounded-md
                dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
                scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div className="space-y-6">
          <WelcomeMessage handleInputChange={handleInputChange} />

          {isLoading && (
            <Card className="max-w-3xl mx-auto border-dashed">
              <CardContent className="flex items-center gap-3 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-law-primary" />
                <span className="text-sm text-muted-foreground">
                  Analyzing documents and drafting an answer...
                </span>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive" className="max-w-3xl mx-auto">
              <AlertTitle>Unable to fetch answer</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {response && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex-1" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleExportPDF}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export to PDF
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Download this consultation as a PDF report
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {lastPrompt && (
                <div className="flex justify-end">
                  <Card className="w-full max-w-2xl bg-law-primary/10 border-law-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wide text-law-primary text-right">
                        You asked
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-right text-sm text-foreground whitespace-pre-line">
                        {lastPrompt}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Answer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formattedAnswer?.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </CardContent>
              </Card>

              {/* Text-to-Speech Reader */}
              <TextToSpeechReader text={response.answer} />

              <Card>
                <CardHeader>
                  <CardTitle>Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {response.sources && response.sources.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {response.sources.map((source, index) => (
                        <Badge
                          key={`${source.source}-${source.chunk_index}-${index}`}
                          variant="outline"
                          className="text-xs"
                        >
                          {source.source ?? "Unknown"} · chunk{" "}
                          {source.chunk_index ?? "-"}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No source metadata returned for this answer.
                    </p>
                  )}
                </CardContent>
              </Card>

              {response.cases && response.cases.length > 0 && (
                <div className="space-y-3">
                  {response.cases.map((caseItem, index) => (
                    <Card
                      key={`${caseItem.source}-${caseItem.chunkIndex}-${index}`}
                    >
                      <CardHeader>
                        <CardTitle>
                          {caseItem.source || `Case ${index + 1}`}
                        </CardTitle>
                        <CardDescription>
                          Chunk {caseItem.chunkIndex ?? "-"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                            Summary
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {caseItem.summary}
                          </p>
                        </div>
                        <details className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-3">
                          <summary className="cursor-pointer text-sm font-medium text-law-primary">
                            View referenced passage
                          </summary>
                          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                            {caseItem.content}
                          </p>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Questions Section */}
          {response && relatedQuestions.length > 0 && (
            <RelatedQuestions
              questions={relatedQuestions}
              onQuestionClick={handleRelatedQuestionClick}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      <div className="border-t dark:border-gray-800 border-gray-200 p-2 sm:p-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

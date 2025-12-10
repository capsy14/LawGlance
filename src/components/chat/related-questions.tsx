"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  isLoading?: boolean;
}

export function RelatedQuestions({
  questions,
  onQuestionClick,
  isLoading = false
}: RelatedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <Card className="max-w-3xl mx-auto border-dashed bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Related Questions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground mb-3">
          You might also want to know:
        </p>
        <div className="grid gap-2">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "h-auto py-3 px-4 text-left justify-between items-start",
                "hover:bg-primary/10 hover:text-primary transition-all duration-200",
                "border border-transparent hover:border-primary/20",
                "group"
              )}
              onClick={() => onQuestionClick(question)}
              disabled={isLoading}
            >
              <span className="text-sm leading-relaxed flex-1 text-foreground group-hover:text-primary">
                {question}
              </span>
              <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

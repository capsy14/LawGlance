"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { Send, Mic, MicOff } from "lucide-react";
import { type FC, useRef, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVoiceInput } from "@/hooks/use-voice-input";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onSaveProject?: () => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onSaveProject
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showVoiceError, setShowVoiceError] = useState(false);

  const {
    transcript,
    isListening,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput({ continuous: true, interimResults: false });

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      const syntheticEvent = {
        target: { value: transcript }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      handleInputChange(syntheticEvent);
    }
  }, [transcript, handleInputChange]);

  // Show voice error alert
  useEffect(() => {
    if (voiceError) {
      setShowVoiceError(true);
      const timer = setTimeout(() => setShowVoiceError(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [voiceError]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !isListening) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <div className="relative mx-4 mb-8 sm:mx-0">
      {showVoiceError && voiceError && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription className="text-xs">{voiceError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask your legal question here..."
            className="flex-1 resize-none bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/60 min-h-[48px] max-h-32"
            minRows={1}
            maxRows={6}
            disabled={isLoading}
          />

          <div className="flex items-center gap-1 px-2 pb-2.5">
            {isSupported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant={isListening ? "destructive" : "ghost"}
                      onClick={handleVoiceToggle}
                      disabled={isLoading}
                      className={cn(
                        "h-9 w-9 rounded-lg",
                        isListening && "animate-pulse"
                      )}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isListening ? "Stop voice input" : "Start voice input"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading || isListening}
                    className="h-9 w-9 rounded-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send (Enter)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span>Listening... Speak your question</span>
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

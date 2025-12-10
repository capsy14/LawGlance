"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Pause, Play, Square } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TextToSpeechReaderProps {
  text: string;
  className?: string;
}

export function TextToSpeechReader({
  text,
  className
}: TextToSpeechReaderProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    currentRate,
    setRate
  } = useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(text);
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleRateChange = (value: number[]) => {
    setRate(value[0]);
  };

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleSpeak}
                    className={cn(
                      "h-9 w-9 rounded-full transition-all duration-300",
                      isSpeaking &&
                        !isPaused &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {isSpeaking && !isPaused ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSpeaking && !isPaused
                    ? "Pause reading"
                    : isPaused
                    ? "Resume reading"
                    : "Read answer aloud"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isSpeaking && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleStop}
                      className="h-9 w-9 rounded-full"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Stop reading</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex-1 flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 flex items-center gap-3">
              <Slider
                value={[currentRate]}
                onValueChange={handleRateChange}
                min={0.5}
                max={2}
                step={0.1}
                className="flex-1"
                disabled={!isSpeaking}
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {currentRate.toFixed(1)}x
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {isSpeaking && (
                <>
                  {isPaused ? (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                      Paused
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      Reading
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {!isSpeaking && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Listen to the answer being read aloud with adjustable speed
          </p>
        )}
      </CardContent>
    </Card>
  );
}

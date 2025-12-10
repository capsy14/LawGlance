"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface VoiceInputOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface VoiceInputReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(
  options: VoiceInputOptions = {}
): VoiceInputReturn {
  const {
    lang = "en-US",
    continuous = false,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;
        recognitionRef.current.lang = lang;
        recognitionRef.current.maxAlternatives = maxAlternatives;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";

          // Only process final results to avoid duplicates
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }

          // Only update if we have a final transcript
          if (finalTranscript) {
            setTranscript((prev) => {
              const newTranscript = (prev + " " + finalTranscript).trim();
              return newTranscript;
            });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);

          if (event.error === "network") {
            setError(
              "Network error: Speech recognition requires internet connection. In Brave, you may need to enable Google services. Go to brave://settings/search and enable 'Use Google services for push messaging'"
            );
          } else if (event.error === "not-allowed") {
            setError(
              "Microphone access denied. Please allow microphone permissions in your browser settings."
            );
          } else if (event.error === "no-speech") {
            setError("No speech detected. Please try again and speak clearly.");
          } else if (event.error === "aborted") {
            setError(null); // User manually stopped, don't show error
          } else {
            setError(
              `Speech recognition error: ${event.error}. Try using Chrome or Edge for better compatibility.`
            );
          }

          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Auto-restart if continuous mode is enabled and we're still supposed to be listening
          if (continuous && isListening) {
            try {
              recognitionRef.current?.start();
            } catch (err) {
              console.log("Recognition ended, not restarting");
            }
          }
        };
      } else {
        setIsSupported(false);
        setError("Speech recognition is not supported in this browser.");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, interimResults, maxAlternatives]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    // Request microphone permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          try {
            setError(null);
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (err: any) {
            console.error("Error starting recognition:", err);
            if (err.name === "InvalidStateError") {
              // Recognition is already started, stop and restart
              recognitionRef.current?.stop();
              setTimeout(() => {
                recognitionRef.current?.start();
                setIsListening(true);
              }, 100);
            } else {
              setError("Failed to start voice recognition. Please try again.");
            }
          }
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err);
          setError(
            "Microphone access denied. Please enable microphone permissions in your browser settings."
          );
        });
    } else {
      setError("Microphone access is not available in this browser.");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
    } catch (err) {
      console.error("Error stopping recognition:", err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
}

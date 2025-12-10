"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TextToSpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface TextToSpeechReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setRate: (rate: number) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  currentRate: number;
}

export function useTextToSpeech(
  options: TextToSpeechOptions = {}
): TextToSpeechReturn {
  const { voice = null, rate = 1, pitch = 1, volume = 1 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentRate, setCurrentRate] = useState(rate);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(voice);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Set default voice (prefer English)
        if (!selectedVoice && availableVoices.length > 0) {
          const englishVoice =
            availableVoices.find((v) => v.lang.startsWith("en")) ||
            availableVoices[0];
          setSelectedVoice(englishVoice);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        console.error("Text-to-speech not supported");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = currentRate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, currentRate, pitch, volume, selectedVoice]
  );

  const pause = useCallback(() => {
    if (
      isSupported &&
      window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused
    ) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const setRate = useCallback((newRate: number) => {
    setCurrentRate(newRate);
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setRate,
    setVoice,
    currentRate
  };
}

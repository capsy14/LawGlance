"use client";

import React from "react";

export function ScaleIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-scale-swing`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3V21M12 3L4 8V10C4 11.5 6 13 8 13C10 13 12 11.5 12 10V3ZM12 3L20 8V10C20 11.5 18 13 16 13C14 13 12 11.5 12 10V3ZM5 21H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GavelIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-gavel-tap`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 3L10 7M10 7L3 14L7 18L14 11M10 7L14 11M14 11L18 7L21 10L17 14M3 21H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookLawIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5V19.5ZM9 7H15M9 11H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LegalBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Animated Shapes */}
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-5">
        <ScaleIcon className="w-32 h-32 text-primary" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-5">
        <GavelIcon className="w-32 h-32 text-primary" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 dark:opacity-[0.02]">
        <ScaleIcon className="w-96 h-96 text-primary animate-float" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
    </div>
  );
}

export function FloatingLegalElement() {
  return (
    <div className="fixed bottom-8 right-8 opacity-20 dark:opacity-10 pointer-events-none animate-float">
      <BookLawIcon className="w-16 h-16 text-primary" />
    </div>
  );
}

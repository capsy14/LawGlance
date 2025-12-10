"use client";

export default function ChatLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900">
      {children}
    </div>
  );
}

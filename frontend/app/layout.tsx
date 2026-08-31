import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'REVORA — Mission Control',
  description: 'Intelligent Revenue Recovery System with AI Reasoning and Deterministic Policy Control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-text-primary min-h-screen antialiased selection:bg-primary-500 selection:text-text-primary">
        {children}
      </body>
    </html>
  );
}

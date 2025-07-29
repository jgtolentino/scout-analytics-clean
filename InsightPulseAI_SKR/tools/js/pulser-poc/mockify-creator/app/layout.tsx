import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scout Dashboard v5 - Component Showcase',
  description: 'MockifyCreator Brand Performance Dashboard with Data Quality Indicators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
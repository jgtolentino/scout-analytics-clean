import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scout Dashboard v5 - Component Showcase',
  description: 'MockifyCreator Brand Performance Dashboard with Data Quality Indicators',
  openGraph: {
    title: 'Scout Dashboard v5',
    description: 'Real-time brand performance analytics with data quality indicators',
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout Dashboard v5',
    description: 'Real-time brand performance analytics with data quality indicators',
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
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
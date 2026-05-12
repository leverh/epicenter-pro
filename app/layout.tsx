import type { Metadata } from 'next';
import QueryProvider from '@/components/QueryProvider/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'EpicenterHub — Data Dashboard Case Study',
  description:
    'A deep dive into migrating a real-time seismic dashboard to Next.js and TypeScript. Featuring React Query orchestration, Zustand state management, and complex data visualization.',
  keywords: [
    'Next.js Migration', 
    'TypeScript Refactoring', 
    'React Query', 
    'Data Visualization', 
    'Zustand', 
    'Seismic Data API'
  ],
  authors: [{ name: 'Made By Ever', url: 'https://madebyever.com' }],

  icons: {
    icon: [
      {
        url: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
  
  openGraph: {
    title: 'EpicenterHub Case Study — Made By Ever',
    description: 'Refactoring a live seismic dashboard: From untyped React to a performance-critical Next.js system.',
    url: 'https://madebyever.com/projects/epicenterhub',
    siteName: 'Made By Ever',
    images: [
      { 
        url: '/images/epicenterhub-og.png',
        width: 1200,
        height: 630,
        alt: 'EpicenterHub Technical Case Study',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'EpicenterHub Case Study | Made By Ever',
    description: 'How I migrated a global seismic dashboard to Next.js 16 and TypeScript.',
    images: ['/images/epicenterhub-og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import QueryProvider from '@/components/QueryProvider/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'EpicenterHub — Real-time Seismic Activity',
  description:
    'Live earthquake monitoring dashboard powered by USGS data. Track seismic activity worldwide with interactive maps, depth analysis, and magnitude charts.',
  keywords: ['earthquake', 'seismic', 'USGS', 'real-time', 'monitoring', 'geoscience'],
  authors: [{ name: 'Made By Ever', url: 'https://madebyever.com/' }],
  openGraph: {
    title: 'EpicenterHub',
    description: 'Real-time seismic activity monitoring worldwide',
    type: 'website',
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
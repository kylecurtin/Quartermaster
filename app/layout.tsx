import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Italiana, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';

const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quartermaster — Surf Provisions Dispatch',
  description:
    'Real-time wetsuit and accessory recommendations from live water and atmospheric telemetry. Default port: Lido Beach, New York.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#F1EAD8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${italiana.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-parchment text-ink">
        <div className="paper-grain" aria-hidden />
        <div className="paper-vignette" aria-hidden />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}

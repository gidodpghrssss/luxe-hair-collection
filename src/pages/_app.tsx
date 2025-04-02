import '@/styles/globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <main className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </main>
    </SessionProvider>
  );
}

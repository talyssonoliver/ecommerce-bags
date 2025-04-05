import React from 'react';
import { Playfair_Display, Open_Sans } from 'next/font/google'
import './globals.css';
import { initSentry } from '@/lib/sentry';

// Initialize Sentry as early as possible
if (typeof window !== 'undefined') {
  initSentry();
}

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ["400", "500", "700"],
})

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-opensans',
  weight: ["300", "400", "600"],
})

export const metadata = {
  title: 'Brazilian Artisanal Bags | Handmade in Brazil',
  description: 'Discover authentic Brazilian artisanal bags, handcrafted by skilled artisans using traditional techniques and sustainable materials.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${openSans.variable}`}>
      <body className="font-opensans text-rich-black bg-white">
        {children}
      </body>
    </html>
  )
}

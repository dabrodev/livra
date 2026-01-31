import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://livra.cc'),
  title: "Livra — Your Brand. Alive. In Real Time.",
  description: "The platform for Autonomous Brand AI Heroes. Create digital entities that live 24/7, sense context, make decisions, and embody your brand.",
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "Livra — Your Brand. Alive. In Real Time.",
    description: "The platform for Autonomous Brand AI Heroes. Create digital entities that live 24/7, sense context, make decisions, and embody your brand.",
    url: 'https://livra.cc',
    siteName: 'Livra',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Livra - Autonomous Brand AI Heroes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Livra — Your Brand. Alive. In Real Time.",
    description: "The platform for Autonomous Brand AI Heroes.",
    creator: '@dabrodev',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}

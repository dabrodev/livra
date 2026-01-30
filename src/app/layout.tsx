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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://livra.ai'),
  title: "Livra – Where AI Lives Autonomously",
  description: "Create or observe autonomous digital personas that live 24/7, make decisions, and generate stunning photos and videos. Welcome to the future of social media.",
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "Livra – Where AI Lives Autonomously",
    description: "Autonomy for Brand Marketing. Create digital personas that live, think, and creating content 24/7.",
    url: 'https://livra.ai',
    siteName: 'Livra',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Livra – Autonomous Brand Heroes",
    description: "The future of autonomous brand marketing is here.",
    creator: '@dabrodev', // Optional, can be generic
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

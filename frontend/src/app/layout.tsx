import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap"
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap"
});

export const metadata: Metadata = {
  title: "DeepSearch Auto — Autonomous Research Platform",
  description: "Autonomous multi-step AI research system that plans, searches, scrapes, and synthesizes comprehensive reports with citations.",
  keywords: ["AI research", "autonomous agent", "deep research", "web scraping", "LangGraph"],
  openGraph: {
    title: "DeepSearch Auto",
    description: "Autonomous AI-powered research platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans bg-[#020817] text-slate-50 min-h-screen antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

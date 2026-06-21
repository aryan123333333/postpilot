import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/components/session-provider";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PostPilot — AI Social Media Post Generator",
  description:
    "Generate viral social media posts in seconds. AI-crafted content for Twitter/X, LinkedIn, Instagram, TikTok, YouTube Long & Shorts. Free to start.",
  keywords: [
    "AI content generator",
    "social media tool",
    "AI post generator",
    "content creation",
    "social media marketing",
    "PostPilot",
    "viral posts",
    "AI copywriting",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "PostPilot — AI Social Media Post Generator",
    description:
      "Generate viral social media posts in seconds. 6 platforms. 6 tones. One click.",
    type: "website",
    siteName: "PostPilot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

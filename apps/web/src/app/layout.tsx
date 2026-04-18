import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-app-sans"
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-app-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  description: "Meta ad tracking dashboard for Energy & Policy Institute.",
  title: "EPI Meta Ad Tracker"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} bg-background text-foreground antialiased`}
      >
        <TRPCReactProvider>
          {children}
          <Analytics />
        </TRPCReactProvider>
      </body>
    </html>
  );
}

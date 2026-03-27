import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-app-sans"
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
        className={`${sans.variable} ${mono.variable} bg-white font-[var(--font-app-sans)] text-primary antialiased`}
      >
        <TRPCReactProvider>
          {children}
          <Analytics />
        </TRPCReactProvider>
      </body>
    </html>
  );
}

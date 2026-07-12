import type { Metadata } from "next";
import { Inter, Space_Grotesk, Instrument_Serif, Montserrat, Syne } from "next/font/google";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import localFont from "next/font/local";
import "./globals.css";
import { CursorGlow } from "@/components/CursorGlow";
import { CustomCursor } from "@/components/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--next-font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--next-font-display",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--next-font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--next-font-montserrat",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--next-font-syne",
  display: "swap",
});

const researcher = localFont({
  src: "../public/font/researcherfontregular.ttf",
  variable: "--font-researcher",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRAJIT BALAJI — Full-Stack AI Engineer",
  description: "A cinematic futuristic tech identity experience. Full-Stack AI Engineer. Creating futuristic digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${montserrat.variable} ${researcher.variable} ${GeistSans.variable} ${GeistMono.variable} ${syne.variable} light`}
      suppressHydrationWarning
    >
      <head>
      </head>
      <body className="antialiased selection:bg-[rgb(var(--amber))] selection:text-[rgb(var(--bg))] min-h-screen">
          <CustomCursor />
          <CursorGlow />
          {children}
      </body>
    </html>
  );
}

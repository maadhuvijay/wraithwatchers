import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeadLinks from "./components/HeadLinks";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WraithWatchers - Ghost Sightings Tracker",
  description: "Track and report ghost sightings across Ohio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <HeadLinks />
        {children}
      </body>
    </html>
  );
}

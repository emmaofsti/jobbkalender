import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Jobbkalender",
  description: "Minimal jobbkalender for én bruker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className={`${manrope.className} ${fraunces.variable} min-h-screen bg-surface text-text`}>
        {children}
      </body>
    </html>
  );
}

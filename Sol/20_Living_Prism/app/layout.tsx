import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const observatoryBasePath = (process.env.NEXT_PUBLIC_OBSERVATORY_BASE_PATH ?? "").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Living Prism — Version Two",
  description: "A living, interactive iridescent organism rendered in real time.",
  icons: { icon: `${observatoryBasePath}/prism-mark.svg` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

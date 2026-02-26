import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Patient Experience HUB",
  description: "Search and observe patient journeys, manage feedback, and improve patient experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoCondensed.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

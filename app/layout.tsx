import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    template: "%s | Talk Canvas Gallery",
    default: "Talk Canvas Gallery",
  },
  description: "Contemporary works & fine-art prints from Lagos.",
  openGraph: {
    title: "Talk Canvas Gallery",
    description: "Contemporary works & fine-art prints from Lagos.",
    url: "/",
    siteName: "Talk Canvas Gallery",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Talk Canvas Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talk Canvas Gallery",
    description: "Contemporary works & fine-art prints from Lagos.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}

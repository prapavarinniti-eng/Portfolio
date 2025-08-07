import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fuzio Catering - บริการจัดเลียงครบวงจร",
  description: "บริการจัดเลี้ยง จัดงาน และอาหารสำหรับงานทุกประเภท ทั้งงานแต่งงาน งานบุญ งานบริษัท ด้วยคุณภาพและรสชาติที่ดีที่สุด",
  keywords: ["จัดเลี้ยง", "catering", "อาหาร", "งานแต่งงาน", "งานบุญ", "จัดงาน", "ร้านอาหาร"],
  authors: [{ name: "Fuzio Catering" }],
  creator: "Fuzio Catering",
  publisher: "Fuzio Catering",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Fuzio Catering - บริการจัดเลียงครบวงจร",
    description: "บริการจัดเลี้ยง จัดงาน และอาหารสำหรับงานทุกประเภท",
    url: "https://fuziocatering.com",
    siteName: "Fuzio Catering",
    locale: "th_TH",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

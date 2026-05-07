import type { Metadata } from "next";
import { Inter, Azeret_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
});

const coopXtra = localFont({
  src: [
    {
      path: "./fonts/CoopXtra-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/CoopXtra-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/CoopXtra-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/CoopXtra-RegularItalic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-coopxtra",
});

export const metadata: Metadata = {
  title: "Billingggggggggggggg",
  description: "Phần mềm tạo và in hóa đơn nhiệt khổ 80mm cho siêu thị, cửa hàng. Hỗ trợ barcode, QR code và xuất PDF.",
  keywords: "in bill, hoa don nhiet, coopxtra bill, tao hoa don, nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${coopXtra.variable} ${azeretMono.variable} antialiased`} style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, minHeight: '100vh', transition: 'all 0.3s' }} className="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}

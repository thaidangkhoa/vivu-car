/* eslint-disable */
// @ts-nocheck
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar"; 
import { NextAuthProvider } from "@/components/Providers"; 
//  1. IMPORT CỤM NÚT NỔI
import FloatingContacts from "@/components/ui/FloatingContacts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViVuCar - Nền tảng thuê xe tự lái hàng đầu",
  description: "Thuê xe nhanh chóng, an toàn và tiện lợi cùng ViVuCar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 font-sans`}>
        <NextAuthProvider>
          <Navbar />
          
          {children}
          
          <Footer />

          {/*  2. GỌI COMPONENT RA ĐÂY (Nó đã chứa sẵng logic tự ẩn ở Admin) */}
          <FloatingContacts />
          
        </NextAuthProvider>
      </body>
    </html>
  );
}
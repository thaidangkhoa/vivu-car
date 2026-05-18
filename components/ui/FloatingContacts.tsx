"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Headset, PhoneCall, Facebook } from "lucide-react";
import Chatbot from "@/components/features/Chatbot"; // Đưa Chatbot vào đây luôn để quản lý chung

// SVG Zalo tự vẽ
const ZaloIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="12" y="15.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="currentColor" stroke="none" style={{fontFamily: "Arial, sans-serif"}}>Zalo</text>
  </svg>
);

export default function FloatingContacts() {
  const pathname = usePathname();

  //  CÔNG TẮC VÀNG: Ẩn toàn bộ nút liên hệ và chatbot ở trang Admin và Dashboard Đối tác
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/partner/dashboard")) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end gap-4 print:hidden">
        
        {/* 1. Nút Facebook */}
        <a
          href="https://www.facebook.com/profile.php?id=61570958711733"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-blue-500/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
        >
          <Facebook size={22} />
          <span className="absolute right-[120%] bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl scale-95 group-hover:scale-100 origin-right">
            Facebook
          </span>
        </a>

        {/* 2. Nút Zalo */}
        <a
          href="https://zalo.me/0559902699"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-500/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
        >
          <ZaloIcon />
          <span className="absolute right-[120%] bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl scale-95 group-hover:scale-100 origin-right">
            Chat Zalo
          </span>
        </a>

        {/* 3. Nút Gọi Điện */}
        <a
          href="tel:0559902699"
          className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg shadow-green-500/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
        >
          <span className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-40"></span>
          <PhoneCall size={22} className="relative z-10 animate-pulse" />
          <span className="absolute right-[120%] bg-[#10B981] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl shadow-green-500/20 scale-95 group-hover:scale-100 origin-right">
            Gọi: 0559.902.699
          </span>
        </a>

        {/* 4. Nút Liên Hệ Hỗ Trợ */}
        <Link
          href="/contact"
          className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#6366F1] text-white shadow-lg shadow-indigo-500/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
        >
          <Headset size={22} />
          <span className="absolute right-[120%] bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl scale-95 group-hover:scale-100 origin-right">
            Trung tâm hỗ trợ
          </span>
        </Link>

      </div>

      {/*  CHATBOT ĐƯỢC GỌI Ở ĐÂY SẼ TỰ ĐỘNG BỊ ẨN THEO ĐIỀU KIỆN TRÊN */}
      <Chatbot />
    </>
  );
}
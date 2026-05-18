/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

//  BẢN ĐỒ LOGO: Khớp tên hãng từ Database với Link ảnh Logo tương ứng
const LOGO_MAP = {
  "VinFast": "https://www.carlogos.org/car-logos/vinfast-logo.png",
  "Toyota": "https://www.carlogos.org/car-logos/toyota-logo.png",
  "Hyundai": "https://www.carlogos.org/car-logos/hyundai-logo.png",
  "Ford": "https://www.carlogos.org/car-logos/ford-logo.png",
  "Mitsubishi": "https://www.carlogos.org/car-logos/mitsubishi-logo.png",
  "Kia": "https://www.carlogos.org/car-logos/kia-logo.png",
  "Mazda": "https://www.carlogos.org/car-logos/mazda-logo.png",
  "Honda": "https://www.carlogos.org/car-logos/honda-logo.png",
  "Subaru": "https://www.carlogos.org/car-logos/subaru-logo.png",
  "Mercedes": "https://www.carlogos.org/car-logos/mercedes-benz-logo.png",
  "BMW": "https://www.carlogos.org/car-logos/bmw-logo.png",
  "Audi": "https://www.carlogos.org/car-logos/audi-logo.png",
  "Porsche": "https://www.carlogos.org/car-logos/porsche-logo.png",
  "Suzuki": "https://www.carlogos.org/car-logos/suzuki-logo.png",
  "Nissan": "https://www.carlogos.org/car-logos/nissan-logo.png",
  "Lexus": "https://www.carlogos.org/car-logos/lexus-logo.png",
  "Volkswagen": "https://www.carlogos.org/car-logos/volkswagen-logo.png",
  "MG": "https://www.carlogos.org/car-logos/mg-logo.png",
  "LandRover": "https://www.carlogos.org/car-logos/land-rover-logo.png",
  "Peugeot": "https://www.carlogos.org/car-logos/peugeot-logo.png",
  "Volvo": "https://www.carlogos.org/car-logos/volvo-logo.png",
  "Chevrolet": "https://www.carlogos.org/car-logos/chevrolet-logo.png",
  "BYD": "https://www.carlogos.org/car-logos/byd-logo.png",
};

export default function BrandList({ brands = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lấy 8 hãng đầu tiên nếu chưa mở rộng, nếu mở rộng thì lấy tất cả
  const visibleBrands = isExpanded ? brands : brands.slice(0, 8);

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#f8fafc] to-white overflow-hidden font-sans">

      {/* 🌟 TRANG TRÍ BACKGROUND (GLOWING EFFECTS) */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
      <div className="absolute -left-32 top-10 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
      <div className="absolute -right-32 bottom-10 w-96 h-96 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">

        {/* 🌟 HEADER ĐỒNG BỘ VỚI TOÀN HỆ THỐNG */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-2 flex items-center gap-3">
              <Sparkles className="text-blue-500" size={32} />
              Thương hiệu nổi bật
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
              Khám phá {brands.length} hãng xe đang sẵn sàng phục vụ
            </p>
          </div>

          {/* NÚT THU GỌN / MỞ RỘNG MƯỢT MÀ HƠN */}
          {brands.length > 8 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl transition-colors border border-transparent hover:border-blue-100 group"
            >
              {isExpanded ? (
                <>Thu gọn <ChevronUp size={14} className="group-hover:-translate-y-1 transition-transform" /></>
              ) : (
                <>Xem tất cả <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" /></>
              )}
            </button>
          )}
        </div>

        {/* 🌟 GRID DANH SÁCH HÃNG XE (GLASSMORPHISM) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 transition-all duration-700 ease-in-out">
          {visibleBrands.map((item) => {
            const brandName = item.brand;
            const carCount = item._count.brand;
            const logoUrl = LOGO_MAP[brandName];

            return (
              <Link
                key={brandName}
                href={`/cars?brand=${brandName}`}
                className="group relative flex flex-col items-center justify-center py-5 px-4 bg-white/70 backdrop-blur-md rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Viền sáng mờ bên trong khi hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* ĐÃ SỬA: Xóa filter, grayscale và opacity-70. Logo luôn giữ màu gốc. Vẫn giữ hiệu ứng phóng to nhẹ khi hover */}
                <div className="relative w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-500 z-10">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brandName}
                      className="max-w-full max-h-full object-contain drop-shadow-sm"
                      onError={(e) => e.currentTarget.src = `https://placehold.co/100x100?text=${brandName}`}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-black text-blue-900 italic shadow-inner">
                      {brandName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* ĐÃ SỬA: Chữ đậm và hiển thị màu xanh đen mặc định cho đồng bộ */}
                <span className="relative z-10 text-[10px] font-black text-blue-900 uppercase tracking-widest text-center transition-colors">
                  {brandName}
                </span>

                {/* ĐÃ SỬA: Bỏ absolute và opacity-0. Chuyển thành mt-2 (cách lề trên) để luôn hiển thị ngay dưới tên hãng. Thêm hiệu ứng đổi màu nền khi hover cho đẹp mắt */}
                <span className="relative mt-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-[8px] font-black rounded-full uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 z-10">
                  {carCount} xe
                </span>
              </Link>
            );
          })}
        </div>

        {/* 🌟 THÔNG BÁO SỐ LƯỢNG KHI THU GỌN */}
        {!isExpanded && brands.length > 8 && (
          <div className="mt-10 text-center animate-pulse">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
              Còn {brands.length - 8} thương hiệu khác đang chờ bạn
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
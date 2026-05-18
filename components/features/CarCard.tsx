/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Users, Settings, Fuel, MapPin, Star, Route } from "lucide-react"; 

export default function CarCard({ car }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ========================================================
  //  XỬ LÝ DỮ LIỆU THẬT TỪ DATABASE
  // ========================================================
  
  // 1. Lấy số chuyến đi thật (Nếu Backend chưa include thì mặc định là 0)
  const realTrips = car._count?.bookings || 0;

  // 2. Tính điểm đánh giá trung bình từ mảng reviews
  let realRating = 0;
  if (car.reviews && car.reviews.length > 0) {
    const totalStars = car.reviews.reduce((sum, review) => sum + review.rating, 0);
    realRating = (totalStars / car.reviews.length).toFixed(1); // Lấy 1 chữ số thập phân (VD: 4.8)
  }

  // ========================================================

  const hasDiscount = car.priceOriginal > car.priceDiscount;
  const discountPercentage = hasDiscount 
    ? Math.round(((car.priceOriginal - car.priceDiscount) / car.priceOriginal) * 100)
    : 0;

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (!mounted) return <div className="min-h-[400px] bg-gray-50 rounded-[32px] animate-pulse" />;

  return (
    <Link 
      href={`/cars/${car.id}`} 
      className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all group relative block flex flex-col h-full"
    >
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg animate-pulse uppercase italic">
          GIẢM {discountPercentage}%
        </div>
      )}

      <div className="relative h-56 overflow-hidden bg-gray-100 shrink-0">
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800"}
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-3 left-4 flex items-center gap-1 text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
          <MapPin size={12} className="text-blue-300" />
          <span className="text-[9px] font-black uppercase tracking-widest">{car.location}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-black text-blue-900 line-clamp-1 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">
            {car.name}
          </h3>
          
          <div className="flex items-center gap-3 mt-2.5">
            {/*  HIỂN THỊ ĐÁNH GIÁ THẬT */}
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md border border-yellow-100">
              <Star size={12} className="fill-yellow-500 text-yellow-500" />
              <span className="text-[11px] font-black">{realRating > 0 ? realRating : "Mới"}</span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            
            {/*  HIỂN THỊ SỐ CHUYẾN ĐI THẬT */}
            <div className="flex items-center gap-1 text-green-600 font-bold">
              <Route size={12} />
              <span className="text-[11px] uppercase tracking-tighter">
                {realTrips > 0 ? `${realTrips} chuyến` : "Chưa có chuyến"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-y border-gray-50 py-4 mb-5 text-center mt-auto">
          <div className="flex flex-col items-center gap-1 border-r border-gray-100">
            <Users size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{car.seats} chỗ</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-r border-gray-100">
            <Settings size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                {car.transmission === "Automatic" ? "Tự động" : "Số sàn"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                {car.fuel === "Gasoline" ? "Xăng" : car.fuel === "Diesel" ? "Dầu" : "Điện"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount && (
              <p className="text-gray-400 text-[10px] line-through font-bold">
                {formatVND(car.priceOriginal)}đ
              </p>
            )}
            <p className="text-blue-600 font-black text-xl italic tracking-tighter">
              {formatVND(car.priceDiscount)}đ
              <span className="text-[10px] text-gray-400 font-bold lowercase not-italic ml-1">/ngày</span>
            </p>
          </div>
          
          <div className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-[10px] font-black group-hover:bg-blue-600 group-hover:text-white transition-all uppercase italic tracking-tighter shadow-sm">
            Chọn xe
          </div>
        </div>
      </div>
    </Link>
  );
}
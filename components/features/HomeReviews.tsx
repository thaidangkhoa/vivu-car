/* eslint-disable */
// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Star, Quote, User as UserIcon } from "lucide-react";

export default async function HomeReviews() {
  //  LẤY DỮ LIỆU THẬT TỪ DATABASE
  let reviews = [];
  try {
    const rawReviews = await prisma.review.findMany({
      where: {
        rating: { gte: 4 }, 
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        car: { select: { name: true } },
      },
      take: 15,
    });

    reviews = rawReviews.filter(r => r.comment && r.comment.trim() !== "").slice(0, 6);
  } catch (error) {
    console.error("Lỗi lấy đánh giá trang chủ:", error);
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    // Đổi nền thành xám siêu nhạt để tôn các thẻ màu trắng lên
    <section className="py-24 bg-slate-50 relative overflow-hidden font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* HEADER ĐỒNG BỘ TYPOGRAPHY */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">
            Khách Hàng Đánh Giá
          </h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] italic max-w-2xl mx-auto">
            Hàng ngàn chuyến đi trọn vẹn và trải nghiệm thực tế từ cộng đồng
          </p>
        </div>

        {/* GRID HIỂN THỊ REVIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              // Thẻ trắng tinh, bo góc tròn trịa, viền mảnh và hiệu ứng trượt nhẹ
              className="group relative bg-white p-8 md:p-10 rounded-[32px] border-2 border-transparent hover:border-blue-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-500 flex flex-col overflow-hidden"
            >
              {/* KỸ THUẬT WATERMARK: Dấu ngoặc kép khổng lồ in chìm ở góc dưới */}
              <Quote className="absolute -bottom-6 -right-6 text-slate-50 w-40 h-40 group-hover:-rotate-12 group-hover:text-blue-50/50 transition-all duration-700 pointer-events-none" />
              
              {/* NGÔI SAO VÀNG: Điểm nhấn màu sắc phá vỡ sự đơn điệu */}
              <div className="flex gap-1.5 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i < review.rating ? "#fbbf24" : "none"} // Màu Amber-400 chuẩn UI
                    className={i < review.rating ? "text-amber-400" : "text-gray-200"} 
                  />
                ))}
              </div>

              {/* NỘI DUNG ĐÁNH GIÁ: Chữ to hơn, màu đậm hơn để dễ đọc */}
              <p className="text-slate-700 italic text-sm md:text-base mb-10 leading-relaxed flex-1 relative z-10 font-medium">
                "{review.comment}"
              </p>

              {/* THÔNG TIN NGƯỜI DÙNG: Căn chỉnh lại tỉ lệ gọn gàng, sang trọng */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-auto relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[16px] flex items-center justify-center font-black uppercase shadow-inner">
                  {review.user?.name ? review.user.name.charAt(0) : <UserIcon size={18} />}
                </div>
                <div>
                  <h4 className="font-black text-blue-950 uppercase text-xs tracking-tight">
                    {review.user?.name || "Khách hàng"}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Xe: <span className="text-blue-600">{review.car?.name}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
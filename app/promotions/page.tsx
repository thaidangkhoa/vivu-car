/* eslint-disable */
// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { Gift, Tag, Copy, Loader2, Check, Sparkles, Calendar, Map, Award, Clock } from "lucide-react";

export default function PromotionsPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then(res => res.json())
      .then(data => {
        setPromos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải mã:", err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    // Tự động trả lại icon Copy sau 2 giây
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Hàm định dạng hiển thị mức giảm giá (Nếu <= 100 thì hiểu là %, lớn hơn thì hiểu là VNĐ)
  const formatDiscount = (discount) => {
    if (discount <= 100) return `Giảm ${discount}%`;
    return `Giảm ${discount.toLocaleString("vi-VN")}đ`;
  };

  //  Hàm phân loại giao diện (Icon & Màu sắc) dựa trên Type của Backend
  const getPromoTheme = (type, code) => {
    const typeStr = (type || "").toUpperCase();
    const codeStr = (code || "").toUpperCase();

    if (typeStr === "NEW_USER" || codeStr.includes("NEW")) {
      return { icon: Sparkles, color: "bg-orange-500", shadow: "shadow-orange-200", label: "Tân Binh" };
    }
    if (typeStr === "WEEKEND" || codeStr.includes("CUOITUAN")) {
      return { icon: Calendar, color: "bg-green-500", shadow: "shadow-green-200", label: "Cuối Tuần" };
    }
    if (typeStr === "LONG_TRIP" || codeStr.includes("3NGAY")) {
      return { icon: Map, color: "bg-purple-500", shadow: "shadow-purple-200", label: "Dài Ngày" };
    }
    if (typeStr === "LOYALTY_5" || codeStr.includes("LAN5")) {
      return { icon: Award, color: "bg-yellow-500", shadow: "shadow-yellow-200", label: "Khách Quen" };
    }
    if (typeStr === "EARLY_BIRD" || codeStr.includes("DATSOM")) {
      return { icon: Clock, color: "bg-teal-500", shadow: "shadow-teal-200", label: "Đặt Sớm" };
    }
    return { icon: Gift, color: "bg-blue-600", shadow: "shadow-blue-200", label: "Ưu Đãi" };
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-28 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">
            Đặc quyền <span className="text-blue-600">AutoHub</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Mã giảm giá dành riêng cho thành viên
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Gift className="mx-auto text-gray-300 mb-4" size={60} />
            <h3 className="text-xl font-bold text-gray-500">Hiện tại chưa có mã ưu đãi nào!</h3>
            <p className="text-gray-400 mt-2">Hãy quay lại sau để cập nhật những chương trình mới nhất nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promos.map((promo) => {
              const theme = getPromoTheme(promo.type, promo.code);
              const ThemeIcon = theme.icon;

              return (
                <div key={promo.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-xl transition-all group relative overflow-hidden">
                  
                  {/* Cột Icon */}
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white flex-shrink-0 z-10 shadow-lg ${theme.color} ${theme.shadow}`}>
                    <ThemeIcon size={36} />
                  </div>

                  {/* Cột Nội dung */}
                  <div className="flex-grow z-10 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
                        {formatDiscount(promo.discount)}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                        {theme.label}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter mt-1">
                      {promo.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm font-medium mt-2 mb-4 line-clamp-2">
                      {promo.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Hiển thị Code */}
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 px-4 py-3 rounded-2xl flex items-center justify-center gap-3 w-full sm:w-auto">
                        <Tag size={16} className="text-blue-600" />
                        <span className="font-black text-blue-900 uppercase tracking-widest">{promo.code}</span>
                      </div>
                      
                      {/* Nút Copy */}
                      <button 
                        onClick={() => copyToClipboard(promo.code)} 
                        className={`p-3.5 rounded-2xl text-white transition-all active:scale-95 flex items-center justify-center w-full sm:w-auto ${
                          copiedCode === promo.code ? "bg-green-500" : "bg-blue-900 hover:bg-black"
                        }`}
                      >
                        {copiedCode === promo.code ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>

                    {/* Hạn sử dụng */}
                    {promo.expiryDate && (
                      <p className="text-[10px] text-red-500 font-bold uppercase mt-4">
                        * HSD: {new Date(promo.expiryDate).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; 
import { useSession } from "next-auth/react";
import { 
  MapPin, Settings, Fuel, Users, CreditCard, ChevronLeft, 
  AlertCircle, ShieldCheck, CheckCircle2, FileText, Truck,
  Gift, Loader2, X 
} from "lucide-react";
import Link from "next/link";
import CarReviews from "@/components/features/CarReviews";

const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

const translateEnum = (value) => {
  const map = {
    "Automatic": "Tự động", "Manual": "Số sàn",
    "Gasoline": "Xăng", "Diesel": "Dầu", "Electric": "Điện",
    "Luxury": "Hạng sang", "Standard": "Phổ thông", "Budget": "Bình dân"
  };
  return map[value] || value;
};

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const { data: session, status } = useSession();
  
  const [car, setCar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");
  const [isOverlapped, setIsOverlapped] = useState(false);
  
  const [isDelivery, setIsDelivery] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const minDateTime = useMemo(() => new Date().toISOString().slice(0, 16), []);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const id = params?.id;
        if (!id) return;
        const res = await fetch(`/api/cars/${id}`); 
        if (res.ok) {
          const data = await res.json();
          setCar(data);
        }
      } catch (error) {
        console.error("Lỗi fetch xe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [params]);

  useEffect(() => {
    if (!startDate || !endDate || !car) {
      setIsOverlapped(false);
      return;
    }
    const sNew = new Date(startDate).getTime();
    const eNew = new Date(endDate).getTime();

    const isBookingOverlap = car.bookings?.some(b => {
      const blockedStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "Đang chờ", "Đã xác nhận", "Đang diễn ra"];
      if (!blockedStatuses.includes(b.status)) return false;

      const sOld = new Date(b.startDate).getTime();
      const eOld = new Date(b.endDate).getTime();
      return sNew < eOld && eNew > sOld;
    });

    const isBlockedOverlap = car.blockedDates?.some(block => {
      const sOld = new Date(block.startDate).getTime();
      const eOld = new Date(block.endDate).getTime();
      return sNew < eOld && eNew > sOld;
    });

    setIsOverlapped(isBookingOverlap || isBlockedOverlap);
  }, [startDate, endDate, car]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    if (!startDate || !endDate) {
      alert("Vui lòng chọn ngày nhận và trả xe trước khi áp dụng mã ưu đãi!");
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: promoCode.trim(),
          startDate: startDate, 
          endDate: endDate      
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAppliedPromo(data);
        alert("Áp dụng mã thành công!"); 
      } else {
        alert(data.error || "Mã không hợp lệ");
        setAppliedPromo(null);
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setIsValidating(false);
    }
  };

  // ===============================================================
  //  LOGIC TÍNH TIỀN: CÓ THÊM DÒNG GIẢI THÍCH (EXPLANATION)
  // ===============================================================
  const billing = useMemo(() => {
    if (!car || !startDate || !endDate || isOverlapped) {
      return { rentalFee: 0, deliveryFee: 0, discount: 0, total: 0, displayTime: "0 giờ", explanation: "" };
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    if (end <= start) {
      return { rentalFee: 0, deliveryFee: 0, discount: 0, total: 0, displayTime: "0 giờ", explanation: "" };
    }

    const totalHours = (end - start) / (1000 * 60 * 60);
    const fullDays = Math.floor(totalHours / 24);
    const leftoverHours = totalHours % 24;

    const dailyRate = car.priceDiscount;
    let rentalFee = fullDays * dailyRate;
    let explanation = ""; // Chứa lời giải thích cho khách hàng

    // Áp dụng Block tính tiền & Ghi lời giải thích
    if (fullDays === 0) {
      if (leftoverHours > 0 && leftoverHours <= 12) {
        rentalFee = dailyRate * 0.7;
        explanation = "Thuê dưới 12h: Tính phí Block nửa ngày (70% giá thuê)";
      } else if (leftoverHours > 12) {
        rentalFee = dailyRate;
        explanation = "Thuê trên 12h: Tính phí Block 1 ngày (100% giá thuê)";
      }
    } else {
      if (leftoverHours === 0) {
        explanation = `Thuê trọn ${fullDays} ngày`;
      } else if (leftoverHours <= 12) {
        rentalFee += (dailyRate * 0.7);
        explanation = `Tính ${fullDays} ngày + Phụ thu nửa ngày (70%) cho ${Math.round(leftoverHours)} giờ vượt mức`;
      } else {
        rentalFee += dailyRate;
        explanation = `Tính ${fullDays} ngày + Phụ thu 1 ngày (100%) cho ${Math.round(leftoverHours)} giờ vượt mức`;
      }
    }

    const displayTime = fullDays > 0 
      ? `${fullDays} ngày ${Math.round(leftoverHours)} giờ` 
      : `${Math.round(leftoverHours)} giờ`;

    const deliveryCost = isDelivery ? (Number(car.deliveryFee) || 0) : 0;
    
    let discountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "PERCENT") {
        discountAmount = (rentalFee * appliedPromo.discount) / 100;
      } else {
        discountAmount = appliedPromo.discount;
      }
    }

    const total = rentalFee + 120000 + deliveryCost - discountAmount;
    
    return {
      rentalFee: Math.round(rentalFee),
      deliveryFee: deliveryCost,
      discount: Math.round(discountAmount),
      total: total < 0 ? 0 : Math.round(total),
      displayTime,
      explanation
    };
  }, [car, startDate, endDate, isOverlapped, isDelivery, appliedPromo]);
  

  const handleRentNow = () => {
    if (status === "unauthenticated") {
      alert("Bạn cần đăng nhập để thực hiện đặt chuyến tại AutoHub!");
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/?auth=login&callback=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!startDate || !endDate) return alert("Vui lòng chọn ngày nhận và trả xe!");
    if (billing.total <= 0) return alert("Thời gian thuê không hợp lệ!");
    if (!isAgreed) return alert("Vui lòng đọc và đồng ý với điều khoản dịch vụ!");
    
    const promoQuery = appliedPromo ? `&promo=${appliedPromo.code}` : "";
    router.push(`/checkout?carId=${car.id}&start=${startDate}&end=${endDate}&isDelivery=${isDelivery}${promoQuery}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic text-blue-600 animate-pulse uppercase tracking-tighter">Đang kết nối hệ thống...</div>;
  if (!car) return <div className="text-center py-20 font-black uppercase italic">404 - Thông tin xe không hợp lệ!</div>;

  let safeAmenities = [];
  let safeGallery = [];
  try { safeAmenities = typeof car.amenities === 'string' ? JSON.parse(car.amenities || "[]") : (car.amenities || []); } catch(e) {}
  try { safeGallery = typeof car.gallery === 'string' ? JSON.parse(car.gallery || "[]") : (car.gallery || []); } catch(e) {}

  const allImages = [car.image, ...safeGallery].filter(Boolean);
  const currentImage = selectedImage || allImages[0];

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-24 font-sans">
      <div className="container mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-8 hover:text-blue-600 transition-all">
          <ChevronLeft size={14} /> Quay lại trang chủ
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white group">
              <img src={currentImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)} className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all flex-shrink-0 ${currentImage === img ? "border-blue-600 shadow-lg shadow-blue-100" : "border-transparent opacity-60"}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase italic">{car.brand}</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase italic">{translateEnum(car.tier)}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-blue-900 uppercase italic tracking-tighter leading-none mb-10">{car.name}</h1>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <Users className="mx-auto text-blue-600 mb-2" size={24}/>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sức chứa</p>
                  <p className="font-black text-gray-800 uppercase italic text-lg">{car.seats} chỗ</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <Settings className="mx-auto text-blue-600 mb-2" size={24}/>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hộp số</p>
                  <p className="font-black text-gray-800 uppercase italic text-lg">{translateEnum(car.transmission)}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <Fuel className="mx-auto text-blue-600 mb-2" size={24}/>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhiên liệu</p>
                  <p className="font-black text-gray-800 uppercase italic text-lg">{translateEnum(car.fuel)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
                <MapPin className="text-blue-600" /> Vị trí & Giao nhận
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <label className={`cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col gap-2 ${!isDelivery ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'}`}>
    <div className="flex justify-between items-center">
      <span className="font-black uppercase tracking-tighter text-blue-900">Tự đến nhận xe</span>
      <input type="radio" name="delivery" className="hidden" checked={!isDelivery} onChange={() => setIsDelivery(false)} />
      {!isDelivery && <CheckCircle2 className="text-blue-600 w-5 h-5" />}
    </div>
    <p className="text-sm font-medium text-gray-600">{car.address || "Đang cập nhật địa chỉ bãi xe"}</p>
    <span className="text-[10px] font-black text-green-600 uppercase mt-2">Miễn phí</span>
  </label>
  
  <label className={`cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col gap-2 ${(Number(car.deliveryFee) === 0 || !car.deliveryFee) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : (isDelivery ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200')}`}>
    <div className="flex justify-between items-center">
      <span className="font-black uppercase tracking-tighter text-blue-900">Giao xe tận nơi</span>
      <input type="radio" name="delivery" className="hidden" disabled={!Number(car.deliveryFee)} checked={isDelivery} onChange={() => setIsDelivery(true)} />
      {isDelivery && <CheckCircle2 className="text-blue-600 w-5 h-5" />}
    </div>
    {/*  ĐÃ CẬP NHẬT CHỖ NÀY: Thay đổi text và thêm cảnh báo bán kính */}
    <p className="text-sm font-medium text-gray-600">Nhận xe tại nhà (Nội thành {car.location})</p>
    <span className="text-[10px] font-black text-orange-600 uppercase mt-1">
      {Number(car.deliveryFee) ? `Phí cơ bản: ${formatCurrency(car.deliveryFee)}` : "Không hỗ trợ giao xe"}
    </span>
    <p className="text-[9px] text-gray-500 italic mt-1 leading-tight">
      * Áp dụng trong bán kính 10km. Xa hơn chủ xe sẽ phụ thu thêm.
    </p>
  </label>
</div>
            </div>

            {safeAmenities && safeAmenities.length > 0 && (
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-blue-600" /> Tiện nghi xe
                </h3>
                <div className="flex flex-wrap gap-3">
                  {safeAmenities.map((item, index) => (
                    <span key={index} className="px-5 py-3 bg-gray-50 text-gray-800 text-sm font-bold rounded-2xl flex items-center gap-2 border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
                <FileText className="text-blue-600" /> Giấy tờ & Điều khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Giấy tờ bắt buộc</p>
                  <p className="text-gray-700 font-medium text-sm whitespace-pre-line leading-relaxed">{car.requirements || "1. CCCD gắn chip\n2. Giấy phép lái xe hạng B1 trở lên\n3. Đặt cọc tài sản thế chấp."}</p>
                </div>
                <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Lưu ý & Phụ thu</p>
                  <p className="text-gray-700 font-medium text-sm whitespace-pre-line leading-relaxed">{car.rules || "Không hút thuốc, không chở đồ có mùi trên xe.\nPhụ thu 100k/giờ nếu trả xe trễ."}</p>
                </div>
              </div>
            </div>
            
            <CarReviews reviews={car.reviews || []} />
          </div>

          <div className="lg:col-span-1">
            <div className={`bg-white p-8 rounded-[40px] shadow-2xl border sticky top-28 transition-all ${isOverlapped ? 'border-red-500 bg-red-50/20' : 'border-blue-50'}`}>
              <div className="mb-8">
                <p className="text-gray-400 line-through text-xs font-bold ml-1">{formatCurrency(car.priceOriginal)}</p>
                <p className="text-5xl font-black text-green-600 italic tracking-tighter leading-none">
                  {formatCurrency(car.priceDiscount)}<span className="text-sm text-gray-400 font-bold not-italic ml-1">/ngày</span>
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thời điểm nhận</label>
                  <input type="datetime-local" min={minDateTime} className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-sm outline-none focus:border-blue-500 transition-all" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thời điểm trả</label>
                  <input type="datetime-local" min={startDate || minDateTime} className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-sm outline-none focus:border-blue-500 transition-all" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-[24px] border border-dashed border-gray-200 mb-6">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block italic">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="VÍ DỤ: BONBONNEW" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-grow bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={isValidating || !promoCode}
                    className="bg-blue-900 text-white px-4 rounded-xl font-black uppercase italic text-[9px] hover:bg-black transition-all active:scale-90 disabled:opacity-50"
                  >
                    {isValidating ? <Loader2 className="animate-spin" size={14}/> : "ÁP DỤNG"}
                  </button>
                </div>

                {appliedPromo && (
                  <div className="mt-3 flex justify-between items-center bg-green-50 p-2 rounded-xl border border-green-100 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Gift size={14} className="text-green-600" />
                      <span className="text-[9px] font-black text-green-700 uppercase italic tracking-tighter leading-none">
                        -{appliedPromo.discount}{appliedPromo.type === "PERCENT" ? "%" : "đ"}
                      </span>
                    </div>
                    <button onClick={() => {setAppliedPromo(null); setPromoCode("");}} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                  </div>
                )}
              </div>

              <div className={`p-6 rounded-[32px] space-y-3 mb-6 text-white transition-all ${isOverlapped ? 'bg-gray-400 shadow-inner' : 'bg-blue-900 shadow-xl shadow-blue-100'}`}>
                
                {/*  ĐÃ CẬP NHẬT: THÊM DÒNG EXPLANATION NẰM NGAY DƯỚI GIÁ THUÊ */}
                <div className="border-b border-white/20 pb-3 mb-3">
                  <div className="flex justify-between items-center text-[10px] opacity-90 font-black uppercase tracking-widest mb-1">
                    <span>Giá thuê ({billing.displayTime})</span>
                    <span className="font-bold text-sm">{formatCurrency(billing.rentalFee)}</span>
                  </div>
                  {billing.explanation && (
                    <p className="text-[9px] text-blue-200 font-medium italic text-right leading-tight">
                      * {billing.explanation}
                    </p>
                  )}
                </div>

                {isDelivery && (
                  <div className="flex justify-between items-center text-[10px] opacity-70 font-black uppercase tracking-widest">
                    <span>Phí giao xe</span>
                    <span className="font-bold">{formatCurrency(billing.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[10px] opacity-70 font-black uppercase tracking-widest">
                  <span>Phí bảo hiểm chuyến đi</span>
                  <span className="font-bold">{formatCurrency(120000)}</span>
                </div>
                {billing.discount > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-green-300 font-black uppercase tracking-widest animate-in fade-in">
                    <span>Mã giảm giá</span>
                    <span className="font-bold">-{formatCurrency(billing.discount)}</span>
                  </div>
                )}
                <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                    <span className="font-black uppercase italic text-xs tracking-tighter">Tổng cộng</span>
                    <span className="text-2xl font-black italic">
                      {isOverlapped ? "LỊCH BẬN" : (billing.total > 0 ? formatCurrency(billing.total) : "0đ")}
                    </span>
                </div>
              </div>

              {isOverlapped && (
                <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase italic mb-6 animate-pulse px-2">
                  <AlertCircle size={14} /> Trùng lịch! Xe đã có người đặt hoặc đang lăn bánh.
                </div>
              )}

              <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <input type="checkbox" id="terms-agree" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" />
                <label htmlFor="terms-agree" className="text-[11px] text-gray-600 cursor-pointer select-none leading-relaxed font-medium">
                  Tôi đã đọc và đồng ý với các <Link href="/policies/terms" target="_blank" className="font-bold text-blue-600 hover:underline">Điều kiện giao dịch</Link>, <Link href="/policies/delivery" target="_blank" className="font-bold text-blue-600 hover:underline">Quy chế giao nhận</Link> và bản mẫu <Link href="/policies/contract" target="_blank" className="font-bold text-blue-600 hover:underline uppercase">Hợp đồng thuê xe</Link> của nền tảng AutoHub.
                </label>
              </div>

              <button 
                onClick={handleRentNow}
                disabled={isOverlapped || billing.total === 0 || !isAgreed}
                className={`w-full py-5 rounded-3xl font-black uppercase italic tracking-tighter shadow-xl transition-all active:scale-95 ${
                  isOverlapped || billing.total === 0 || !isAgreed 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 shadow-blue-100'
                }`}
              >
                {isOverlapped ? "Đã có lịch bận" : (!isAgreed ? "Vui lòng đồng ý điều khoản" : "Xác nhận thuê ngay")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
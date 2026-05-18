/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; 
import { 
  User, ChevronLeft, Calendar, 
  CreditCard, MapPin, Loader2, ArrowRight, Truck, AlertTriangle 
} from "lucide-react";

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { data: session, status } = useSession();
  
  const [car, setCar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [appliedPromo, setAppliedPromo] = useState(null);

  const carId = searchParams.get("carId");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const isDeliveryFromUrl = searchParams.get("isDelivery") === "true";
  const promoFromUrl = searchParams.get("promo");

  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    note: "",
    deliveryAddress: ""
  });

  useEffect(() => {
    setMounted(true);

    if (status === "unauthenticated") {
      alert("Vui lòng đăng nhập để thực hiện đặt chuyến!");
      const currentQuery = searchParams.toString();
      router.push(`/?auth=login&callback=/checkout?${currentQuery}`);
      return;
    }

    if (status === "authenticated" && session?.user) {
      setFormData(f => ({ 
        ...f, 
        name: session.user.name || f.name, 
        phone: session.user.phone || f.phone, 
        email: session.user.email || f.email 
      }));
    }

    if (carId) {
      fetch(`/api/cars/${carId}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setCar(data))
        .catch(() => router.push("/"));
    }
  }, [carId, router, status, session, searchParams]);

  useEffect(() => {
    if (promoFromUrl && startDate && endDate) {
      const validatePromo = async () => {
        try {
          const res = await fetch("/api/promotions/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              code: promoFromUrl,
              startDate: startDate,
              endDate: endDate      
            })
          });
          
          const data = await res.json();
          
          if (res.ok) {
            setAppliedPromo(data);
          } else {
            alert(`Lỗi áp dụng mã ưu đãi: ${data.error}`);
            setAppliedPromo(null);
          }
        } catch (error) {
          console.error("Lỗi xác thực mã giảm giá:", error);
        }
      };
      validatePromo();
    }
  }, [promoFromUrl, startDate, endDate]);

  const billing = useMemo(() => {
    if (!car || !startDate || !endDate) return { days: 0, rentalFee: 0, serviceFee: 120000, deliveryFee: 0, discount: 0, total: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const finalDays = diffDays <= 0 ? 1 : diffDays;

    const pricePerDay = car.priceDiscount || car.priceOriginal;
    const rentalFee = pricePerDay * finalDays;
    const serviceFee = 120000;
    
    const deliveryFee = isDeliveryFromUrl ? (Number(car.deliveryFee) || 0) : 0; 

    let discountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "PERCENT") {
        discountAmount = (rentalFee * appliedPromo.discount) / 100;
      } else {
        discountAmount = appliedPromo.discount;
      }
    }

    const total = rentalFee + serviceFee + deliveryFee - discountAmount;
    return { days: finalDays, rentalFee, serviceFee, deliveryFee, discount: discountAmount, total: total < 0 ? 0 : total };
  }, [car, startDate, endDate, appliedPromo, isDeliveryFromUrl]);

  const handleConfirm = async () => {
    if (!session?.user?.id) return alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
    if (!formData.name || !formData.phone) return alert("Vui lòng nhập tên và số điện thoại!");
    
    //  LỚP BẢO VỆ NGHIỆP VỤ GIAO XE
    if (isDeliveryFromUrl) {
      if (!formData.deliveryAddress.trim()) {
        return alert(`Vui lòng nhập địa chỉ giao xe chi tiết tại khu vực ${car?.location}!`);
      }
      
      // Bắt khách hàng xác nhận lại một lần nữa trước khi gửi đơn
      const isConfirmed = window.confirm(
        `XÁC NHẬN GIAO XE:\n\nXe này chỉ hỗ trợ giao trong nội thành ${car?.location}.\nPhí ${formatCurrency(billing.deliveryFee)} áp dụng cho bán kính 10km.\n\nNếu địa chỉ của bạn xa hơn hoặc khác tỉnh, chủ xe có quyền từ chối hoặc thỏa thuận phụ thu.\n\nBạn có chắc chắn muốn tiếp tục đặt xe?`
      );
      if (!isConfirmed) return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: session.user.id, 
        carId: Number(carId),
        startDate,
        endDate,
        totalPrice: billing.total,
        promoCode: appliedPromo?.code || null,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerNote: formData.note,
        paymentMethod: "DEPOSIT",
        isDelivery: isDeliveryFromUrl,
        deliveryAddress: isDeliveryFromUrl ? formData.deliveryAddress : null,
        deliveryFee: billing.deliveryFee
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        router.push(`/payment/${result.booking.id}`);
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert("Lỗi kết nối!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || status === "loading") return (
    <div className="min-h-screen flex items-center justify-center font-black italic text-blue-600 animate-pulse uppercase">
      Đang chuẩn bị hồ sơ thanh toán...
    </div>
  );
  
  if (!car) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-8 hover:text-blue-600 transition-all">
          <ChevronLeft size={14} /> Kiểm tra lại lịch trình
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-900 p-2 rounded-xl text-white"><Calendar size={20}/></div>
                <div>
                    <h3 className="font-black text-blue-900 uppercase text-sm italic leading-none">Lịch trình thuê xe</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Thời gian nhận và trả xe dự kiến</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-8 rounded-[24px] border border-gray-100 gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Ngày nhận xe</p>
                  <p className="text-sm font-black text-blue-900 uppercase italic leading-none mb-1">{new Date(startDate).toLocaleDateString('vi-VN')}</p>
                  <p className="text-3xl font-black text-blue-600 italic tracking-tighter leading-none">
                    {new Date(startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 text-gray-300">
                   <ArrowRight size={24} className="rotate-90 md:rotate-0" />
                   <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{billing.days} ngày</span>
                </div>

                <div className="flex-1 text-center md:text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Ngày trả xe</p>
                  <p className="text-sm font-black text-blue-900 uppercase italic leading-none mb-1">{new Date(endDate).toLocaleDateString('vi-VN')}</p>
                  <p className="text-3xl font-black text-blue-600 italic tracking-tighter leading-none">
                    {new Date(endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </section>

            {/* XÁC NHẬN HÌNH THỨC GIAO XE */}
            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-900 p-2 rounded-xl text-white"><Truck size={20}/></div>
                <div>
                    <h3 className="font-black text-blue-900 uppercase text-sm italic leading-none">Hình thức nhận xe</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Thông tin giao nhận đã chọn</p>
                </div>
              </div>

              {isDeliveryFromUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/50 border-2 border-blue-600 rounded-2xl flex items-center justify-between">
                    <span className="font-black uppercase italic text-sm text-blue-900">Giao xe tận nơi</span>
                    <span className="text-[10px] font-black text-orange-600 uppercase">Phí: {formatCurrency(billing.deliveryFee)}</span>
                  </div>
                  
                  {/*  FORM NHẬP ĐỊA CHỈ & LỜI CẢNH BÁO */}
                  <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-4">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 italic flex items-center gap-1.5">
                      <MapPin size={12}/> Địa chỉ giao xe (Nội thành {car.location}) *
                    </label>
                    <input 
                      type="text" 
                      placeholder="VD: Số 123 Đường ABC, Phường X, Quận Y..."
                      value={formData.deliveryAddress} 
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" 
                      onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} 
                    />
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                      <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14}/>
                      <p className="text-[10px] text-red-700 font-medium leading-relaxed italic">
                        <strong className="font-black uppercase">Lưu ý quan trọng:</strong> Phí giao xe chỉ áp dụng trong bán kính 10km thuộc khu vực <strong>{car.location}</strong>. Nếu địa chỉ của bạn nằm khác Tỉnh/Thành phố hoặc xa hơn 10km, chủ xe có quyền từ chối hoặc thỏa thuận phụ thu trực tiếp.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/50 border-2 border-blue-600 rounded-2xl flex flex-col gap-2">
                    <span className="font-black uppercase italic text-sm text-blue-900">Tự đến lấy xe tại bãi</span>
                    <p className="text-sm font-medium text-gray-600">{car.address || "Đang cập nhật địa chỉ bãi xe"}</p>
                </div>
              )}
            </section>

            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-900 p-2 rounded-xl text-white"><User size={20}/></div>
                <div>
                    <h3 className="font-black text-blue-900 uppercase text-sm italic leading-none">Hồ sơ người lái xe</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Thông tin dùng để làm hợp đồng thuê xe</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên *</label>
                  <input type="text" value={formData.name} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại *</label>
                  <input type="tel" value={formData.phone} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ghi chú chuyến đi</label>
                  <textarea value={formData.note} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold text-gray-700 h-24 outline-none focus:border-blue-500" onChange={e => setFormData({...formData, note: e.target.value})} />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-gray-100 sticky top-28">
              <div className="aspect-video rounded-3xl overflow-hidden mb-6 shadow-lg border border-gray-50">
                <img src={car.image} className="w-full h-full object-cover" />
              </div>
              
              <div className="mb-6 border-b border-gray-100 pb-6">
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase italic">{car.brand}</span>
                <h2 className="text-2xl font-black text-blue-900 mt-2 uppercase italic tracking-tighter leading-tight">{car.name}</h2>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase italic">
                  <span>Giá thuê ({billing.days} ngày)</span>
                  <span className="text-gray-800">{formatCurrency(billing.rentalFee)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase italic">
                  <span>Phí dịch vụ</span>
                  <span className="text-gray-800">{formatCurrency(billing.serviceFee)}</span>
                </div>
                
                {isDeliveryFromUrl && (
                  <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase italic animate-in fade-in">
                    <span>Phí giao xe tận nơi</span>
                    <span>{formatCurrency(billing.deliveryFee)}</span>
                  </div>
                )}

                {billing.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-black text-green-600 uppercase italic">
                    <span>Mã giảm giá ({appliedPromo?.code})</span>
                    <span>-{formatCurrency(billing.discount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t-2 border-blue-50 flex justify-between items-center">
                  <span className="text-blue-900 font-black uppercase italic text-xs tracking-widest">Tổng cộng</span>
                  <span className="font-black text-3xl text-blue-600 italic tracking-tighter transition-all">{formatCurrency(billing.total)}</span>
                </div>
              </div>

              <button 
                onClick={handleConfirm} 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[24px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:bg-gray-400 uppercase italic tracking-tighter flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><CreditCard size={20}/> XÁC NHẬN ĐẶT CHUYẾN</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
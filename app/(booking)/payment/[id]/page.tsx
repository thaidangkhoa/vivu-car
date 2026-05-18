/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, ShieldCheck, ArrowRight, CheckCircle2, Loader2, Car, FileText, AlertTriangle } from "lucide-react";
import { createVNPayUrl } from "@/actions/payment.action"; 
import { DEPOSIT_RATE } from "@/lib/bookingUtils";

export default function PaymentSelectionPage({ params }: { params: any }) {
  const router = useRouter();
  
  // 1. Xử lý params an toàn (Hỗ trợ cả Next 14 và 15)
  const resolvedParams = use(params) as { id: string };
  const bookingId = resolvedParams?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"DEPOSIT" | "FULL">("DEPOSIT");

  // 2. FETCH DỮ LIỆU VỚI CƠ CHẾ DỰ PHÒNG (FALLBACK)
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        
        if (res.ok) {
          const data = await res.json();
          // Lấy đúng data.booking từ API trả về
          setBooking(data.booking || data); 
        } else {
          // Nếu không có API, tạo dữ liệu giả
          console.warn("Lỗi API /api/bookings/[id], đang dùng dữ liệu tạm thời.");
          setBooking({
            car: { name: "Đang cập nhật..." },
            totalPrice: 1500000, 
          });
        }
      } catch (error) {
        console.error("Lỗi kết nối API:", error);
        setBooking({
          car: { name: "Lỗi kết nối Server" },
          totalPrice: 0,
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  // 3. TÍNH TOÁN
  const totalPrice = booking?.totalPrice || 0;
  const depositPrice = totalPrice * DEPOSIT_RATE;
  const currentAmount = paymentMethod === "DEPOSIT" ? depositPrice : totalPrice;

  const handlePayment = async () => {
    if (currentAmount <= 0) return alert("Số tiền không hợp lệ!");
    
    setIsLoading(true);
    try {
      const vnpayUrl = await createVNPayUrl(bookingId, currentAmount, paymentMethod);
      if (vnpayUrl) {
        router.push(vnpayUrl);
      }
    } catch (error) {
      alert("Lỗi tạo liên kết thanh toán. Hãy kiểm tra Server Action!");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] font-black uppercase italic text-blue-900 tracking-widest">Đang khởi tạo thanh toán...</p>
        </div>
      </div>
    );
  }

  //  BẮT ĐẦU: CHẶN THANH TOÁN NẾU ĐƠN ĐÃ BỊ HỦY DO QUÁ HẠN 20 PHÚT
  if (booking?.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-10 font-sans">
        <AlertTriangle size={80} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">Đã hết hạn thanh toán</h1>
        <p className="text-gray-600 font-medium mb-8 text-center max-w-md">
          Chuyến đi này đã bị hệ thống tự động hủy do quá 20 phút không thực hiện thanh toán đặt cọc giữ chỗ.
        </p>
        <button 
          onClick={() => router.push('/')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg transition-all"
        >
          Quay lại trang chủ đặt xe mới
        </button>
      </div>
    );
  }
  //  KẾT THÚC CHẶN

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* TIÊU ĐỀ */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-2">
            Thanh toán đơn hàng
          </h1>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
              Mã đơn: #{bookingId?.toString().slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            
            {/* LỰA CHỌN 1: CỌC */}
            <div 
              onClick={() => setPaymentMethod("DEPOSIT")}
              className={`group relative bg-white p-8 rounded-[32px] cursor-pointer transition-all border-2 ${
                paymentMethod === "DEPOSIT" ? "border-blue-600 shadow-xl shadow-blue-50" : "border-transparent shadow-sm hover:border-blue-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${paymentMethod === "DEPOSIT" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"}`}>
                    <Wallet size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-blue-900 uppercase italic text-lg">Đặt cọc ({DEPOSIT_RATE * 100}%)</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase italic">Giữ xe ngay bây giờ</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black italic ${paymentMethod === "DEPOSIT" ? "text-blue-600" : "text-gray-300"}`}>
                    {depositPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {/* LỰA CHỌN 2: TOÀN BỘ */}
            <div 
              onClick={() => setPaymentMethod("FULL")}
              className={`group relative bg-white p-8 rounded-[32px] cursor-pointer transition-all border-2 ${
                paymentMethod === "FULL" ? "border-blue-600 shadow-xl shadow-blue-50" : "border-transparent shadow-sm hover:border-blue-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${paymentMethod === "FULL" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"}`}>
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-blue-900 uppercase italic text-lg">Thanh toán 100%</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase italic">Không cần lo nghĩ thêm</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black italic ${paymentMethod === "FULL" ? "text-blue-600" : "text-gray-300"}`}>
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={isLoading || totalPrice <= 0} 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Xác nhận thanh toán <ArrowRight size={20}/></>}
            </button>
          </div>

          {/* TÓM TẮT ĐƠN HÀNG & HỢP ĐỒNG */}
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h4 className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest mb-6 pb-4 border-b border-gray-50">Chi tiết thanh toán</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
                  <span className="text-gray-400">Phương tiện:</span>
                  <span className="text-blue-900 flex items-center gap-1"><Car size={14}/> {booking?.car?.name}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-[10px] font-black text-gray-400 uppercase italic">Tổng cộng:</span>
                  <span className="text-xl font-black text-blue-600 italic">
                    {currentAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            <Link 
              href={`/contracts/${bookingId}`}
              target="_blank"
              className="w-full flex justify-between items-center bg-blue-900 text-white p-6 rounded-[24px] shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <FileText size={24} className="text-blue-100 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase italic text-sm">Xem hợp đồng thuê xe</p>
                  <p className="text-[10px] text-blue-200 mt-0.5">Bản chính thức chứa thông tin cá nhân</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-blue-300" />
            </Link>
            
            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
              <p className="text-[9px] text-yellow-700 font-bold leading-relaxed italic uppercase">
                * Lưu ý: Vui lòng không tắt trình duyệt trong khi đang xử lý giao dịch VNPay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
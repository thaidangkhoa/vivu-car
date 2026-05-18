/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, ShieldCheck, MapPin, Calendar, 
  Phone, User as UserIcon, AlertTriangle, CreditCard, Loader2,
  FileText, Receipt, Car, CheckCircle2, Star, AlertOctagon, X 
} from "lucide-react";

import ReviewModal from "@/components/features/ReviewModal";
import { getBookingState } from "@/lib/bookingUtils";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  //  STATE QUẢN LÝ POPUP BÁO CÁO SỰ CỐ
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const fetchBookingDetail = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();

      if (res.ok) {
        setBooking(data.booking);
      } else {
        setError(data.error || "Không thể tải chi tiết đơn hàng.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingDetail();
  }, [bookingId]);

  //  HÀM XỬ LÝ GỬI BÁO CÁO SỰ CỐ LÊN SERVER
  const handleReportIssue = async () => {
    if (!reportReason) return alert("Vui lòng chọn hoặc nhập lý do sự cố!");
    setIsReporting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        alert("Đã gửi báo cáo khẩn cấp lên hệ thống. Đơn hàng đang bị đóng băng tranh chấp!");
        fetchBookingDetail(); // Load lại data để cập nhật trạng thái
        setIsReportOpen(false);
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (e) {
      alert("Lỗi kết nối mạng!");
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-blue-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-[10px] italic">Đang tải dữ liệu chuyến đi...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-20">
        <AlertTriangle size={64} className="text-red-400 mb-4" />
        <h2 className="text-xl font-black text-blue-900 uppercase italic tracking-tighter mb-2">Lỗi truy xuất</h2>
        <p className="text-gray-500 font-medium mb-6 text-sm">{error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-blue-600 text-white font-black text-[10px] uppercase rounded-xl shadow-lg hover:bg-blue-700">
          Quay lại lịch sử
        </button>
      </div>
    );
  }

  const deliveryFee = booking.deliveryFee || 0; 
  const serviceFee = booking.serviceFee || 120000; 
  const carRentalFee = booking.totalPrice - deliveryFee - serviceFee; 
  
  let depositAmount = booking.depositAmount || (booking.totalPrice * 0.3);
  let depositPaid = 0;
  let balanceDue = booking.totalPrice;

  if (booking.paymentStatus === "PAID_FULL") {
     depositPaid = booking.totalPrice;
     balanceDue = 0;
  } else if (booking.status !== "PENDING" && booking.status !== "CANCELLED") {
     depositPaid = depositAmount;
     balanceDue = booking.totalPrice - depositPaid;
  }

  const isCompanyCar = booking.car?.ownerType === "COMPANY" || !booking.car?.userId;
  const ownerName = isCompanyCar ? "Hệ Thống ViVuCar" : (booking.car?.user?.name || booking.car?.ownerName || "Đối tác ViVuCar");
  const ownerPhone = isCompanyCar ? "0789430618" : (booking.car?.user?.phone || booking.car?.ownerPhone || "Chưa cập nhật");
  const isHomeDelivery = deliveryFee > 0;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-28 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 font-black uppercase italic text-[10px] mb-6 hover:bg-blue-50 px-4 py-2 rounded-xl w-fit transition-all">
          <ChevronLeft size={16} /> Quay lại lịch sử
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter">
            Chi tiết chuyến đi <span className="text-blue-600">#{booking.id}</span>
          </h1>
          
          {/*  1. ĐÃ SỬA: SỬ DỤNG HÀM getBookingState ĐỂ TỰ ĐỘNG LẤY MÀU VÀ TEXT */}
          {(() => {
            const state = getBookingState(booking);
            return (
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic border shadow-sm ${state.badgeClass}`}>
                {state.text}
              </span>
            );
          })()}
        </div>

        {/*  2. THÊM MỚI: BANNER THÔNG BÁO HOÀN TIỀN NẰM NGAY DƯỚI TIÊU ĐỀ */}
        {booking.status === "CANCELLED" && booking.paymentStatus === "REFUNDED" && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-emerald-700 font-black uppercase text-sm mb-1 tracking-tight">
                  Đã xử lý khiếu nại & Hoàn tiền
                </h3>
                <p className="text-emerald-600 text-xs leading-relaxed">
                  Quản trị viên đã xem xét yêu cầu của bạn. Chuyến đi đã được hủy và số tiền cọc <strong className="text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">{new Intl.NumberFormat("vi-VN").format(booking.depositAmount)}đ</strong> đã được hệ thống hoàn trả lại về tài khoản ngân hàng của bạn.
                </p>
                
                {booking.issueReport && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-100 text-[11px] text-gray-600">
                    <span className="font-black text-emerald-700 uppercase tracking-widest text-[9px] block mb-1">Phản hồi từ Ban Quản Trị:</span>
                    <span className="italic">"{booking.issueReport.split('||').pop()?.trim()}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            
            {/*  BẢNG CẢNH BÁO NẾU ĐƠN HÀNG ĐANG BỊ TRANH CHẤP */}
            {booking.status === "DISPUTED" && (
              <div className="bg-red-50 p-6 rounded-[32px] border-2 border-red-200 animate-in fade-in slide-in-from-top-4">
                 <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={24} className="text-red-500" />
                    <h3 className="font-black text-red-600 uppercase tracking-widest text-sm">Hệ thống đang xử lý sự cố</h3>
                 </div>
                 <p className="text-sm text-red-800 font-medium leading-relaxed">
                   Đơn hàng này đã được ghi nhận sự cố: <strong className="font-bold">"{booking.issueReport}"</strong>. Bộ phận CSKH đang liên hệ với chủ xe để giải quyết và sẽ hoàn tiền cọc cho bạn theo đúng hợp đồng.
                 </p>
              </div>
            )}

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-blue-900 uppercase italic mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Hành trình & Giao nhận
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <img src={booking.car?.image || "https://placehold.co/600x400?text=ViVuCar"} className="w-full sm:w-40 h-28 object-cover rounded-2xl bg-gray-100" alt="Car" />
                <div>
                  <h3 className="font-black text-xl text-blue-900 uppercase italic tracking-tighter leading-none mb-2">{booking.car?.name}</h3>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                      <Car size={12} className="text-blue-500" /> 
                      Hình thức: {isHomeDelivery ? <span className="text-blue-600">Giao xe tận nơi</span> : <span>Tự đến lấy xe</span>}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-start gap-1.5 leading-tight">
                      <MapPin size={12} className="text-red-500 shrink-0 mt-0.5" /> 
                      <span>{booking.location || booking.car?.address || booking.car?.location || "Chưa cập nhật địa chỉ"}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nhận xe</p>
                  <p className="text-sm font-black uppercase italic text-blue-900 leading-none">
                    {new Date(booking.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{new Date(booking.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-2 text-gray-300">
                    <Calendar size={14} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trả xe</p>
                  <p className="text-sm font-black uppercase italic text-blue-900 leading-none">
                    {new Date(booking.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{new Date(booking.endDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-blue-900 uppercase italic mb-4 flex items-center gap-2">
                <Receipt size={18} className="text-blue-600" /> Bảng kê chi phí
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                    <span>Đơn giá thuê xe gốc</span>
                    <span>{carRentalFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                    <span>Phí bảo hiểm chuyến đi</span>
                    <span>{serviceFee > 0 ? `${serviceFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                  </div>
                  {isHomeDelivery && (
                    <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                      <span>Phí giao xe tận nơi</span>
                      <span>{deliveryFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm font-black text-blue-900 uppercase">
                <span>Tổng cộng</span>
                  <span className="text-lg">{(booking.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                </div>

                <div className="pt-3 space-y-3 border-t border-dashed border-gray-200 mt-4">
                  {/* 1. XỬ LÝ HIỂN THỊ PHẦN TIỀN CỌC */}
                  {booking.status === "PENDING" ? (
                    <div className="flex justify-between items-center text-sm text-gray-500 font-bold">
                      <span>Tiền cọc cần thanh toán (30%)</span>
                      <span className="text-orange-500 flex items-center gap-1">
                        {(depositAmount || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm text-gray-500 font-bold">
                      <span>Đã thanh toán qua web (Cọc)</span>
                      <div className="text-right">
                        <span className={`flex items-center justify-end gap-1 ${booking.paymentStatus === "REFUNDED" ? "text-gray-400 line-through" : "text-emerald-500"}`}>
                          {booking.paymentStatus !== "REFUNDED" && <CheckCircle2 size={14} />}
                          -{ (booking.depositAmount || 0).toLocaleString('vi-VN') }đ
                        </span>
                        {/* Hiện tag Đã hoàn tiền nếu Refunded */}
                        {booking.paymentStatus === "REFUNDED" && (
                          <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-100 px-1.5 py-0.5 rounded mt-1 inline-block border border-emerald-200">
                            Đã hoàn tiền
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 2. BOX THANH TOÁN THÔNG MINH (ĐỔI MÀU & HIỂN THỊ THEO TRẠNG THÁI) */}
                  {booking.status === "CANCELLED" ? (
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-200 opacity-80 mt-2">
                      <div>
                        <span className="block text-[12px] font-black text-gray-500 uppercase tracking-widest">Số tiền cần thanh toán</span>
                        <span className="text-[9px] text-gray-400 font-medium italic">
                          {booking.paymentStatus === "REFUNDED" ? "* Đơn hủy và đã hoàn cọc" : "* Đơn hàng đã bị hủy"}
                        </span>
                      </div>
                      <span className="text-3xl font-black text-gray-400 italic tracking-tighter">
                        0đ
                      </span>
                    </div>
                  ) : booking.status === "COMPLETED" || booking.status === "RETURNED" ? (
                    <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-200 mt-2">
                      <div>
                        <span className="block text-[12px] font-black text-emerald-700 uppercase tracking-widest">Trạng thái thanh toán</span>
                        <span className="text-[9px] text-emerald-600 font-medium italic">* Chuyến đi đã hoàn tất</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-600 italic tracking-tighter">
                        ĐÃ THANH TOÁN
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100 mt-2">
                      <div>
                        <span className="block text-[12px] font-black text-blue-900 uppercase tracking-widest">Tiền mặt trả chủ xe</span>
                        <span className="text-[9px] text-blue-600/70 font-medium italic">* Vui lòng thanh toán khi nhận xe</span>
                      </div>
                      <span className="text-3xl font-black text-blue-600 italic tracking-tighter">
                        {(balanceDue || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <h2 className="font-black text-blue-900 uppercase italic tracking-tighter text-lg mb-4">Thông tin liên hệ</h2>
              
              {booking.status === "PENDING" ? (
                 <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                   <ShieldCheck className="text-orange-400 mx-auto mb-2" size={24} />
                   <p className="text-[10px] font-black uppercase text-orange-600 mb-1">Bảo mật thông tin</p>
                   <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                     Đang chờ thanh toán. Thông tin liên hệ sẽ được hiển thị ngay khi bạn hoàn tất đặt cọc.
                   </p>
                 </div>
              ) : booking.status === "CANCELLED" || booking.status === "DISPUTED" ? (
                 <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                   <AlertTriangle className="text-gray-400 mx-auto mb-2" size={24} />
                   <p className="text-[10px] text-gray-500 font-medium">Giao dịch đã bị đóng, thông tin liên lạc được ẩn để bảo mật.</p>
                 </div>
              ) : (
                 <div className="flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 overflow-hidden shadow-inner">
                     <img src={`https://ui-avatars.com/api/?name=${ownerName}&background=0D47A1&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                   </div>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Chủ xe</p>
                   <p className="font-black text-blue-900 text-lg uppercase italic tracking-tighter mb-4 text-center">{ownerName}</p>
                   
                   <div className="w-full bg-white border border-blue-100 p-3 rounded-xl flex items-center justify-between mb-4 shadow-sm">
                     <span className="text-[10px] font-black text-blue-400 uppercase">SĐT</span>
                     <span className="font-black text-blue-600 tracking-wider">{ownerPhone}</span>
                   </div>

                   <a href={`tel:${ownerPhone}`} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-black uppercase italic text-[11px] rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                     <Phone size={14} /> Gọi ngay
                   </a>
                 </div>
              )}
            </div>

            {booking.status !== "PENDING" && booking.status !== "CANCELLED" && booking.status !== "DISPUTED" && (
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 transform group-hover:scale-110 transition-all duration-500" />
                <h3 className="font-black uppercase italic tracking-tighter text-lg mb-2 relative z-10">Hợp đồng thuê xe</h3>
                <p className="text-[10px] text-blue-200 font-medium leading-relaxed mb-4 relative z-10 pr-4">
                  Các điều khoản, quyền lợi và trách nhiệm của hai bên đã được ghi nhận trên hệ thống.
                </p>
                <Link 
                  href={`/contracts/${booking.id}`}
                  className="w-full bg-white/20 hover:bg-white text-white hover:text-blue-900 backdrop-blur-sm flex justify-center items-center gap-2 py-3 font-black uppercase italic text-[10px] rounded-xl transition-all relative z-10 border border-white/30 hover:border-white"
                >
                  <FileText size={14} /> Xem lại hợp đồng
                </Link>
              </div>
            )}
            
            {booking.status === "COMPLETED" && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-[32px] text-white shadow-xl shadow-orange-200 relative overflow-hidden group">
                <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-white/20 transform group-hover:scale-110 transition-all duration-500 fill-white/20" />
                <h3 className="font-black uppercase italic tracking-tighter text-lg mb-2 relative z-10">Đánh giá dịch vụ</h3>
                <p className="text-[10px] text-orange-100 font-medium leading-relaxed mb-4 relative z-10 pr-4">
                  Trải nghiệm của bạn như thế nào? Hãy chia sẻ để cộng đồng ViVuCar ngày càng tốt hơn nhé!
                </p>
                <button 
                  onClick={() => setIsReviewOpen(true)}
                  className="w-full bg-white text-orange-500 hover:bg-orange-50 flex justify-center items-center gap-2 py-3 font-black uppercase italic text-[10px] rounded-xl transition-all relative z-10 shadow-md"
                >
                  <Star size={14} className="fill-orange-500" /> Viết Đánh Giá Ngay
                </button>
              </div>
            )}

            {booking.status === "PENDING" && (
              <Link href={`/payment/${booking.id}`} className="w-full flex justify-center py-4 bg-blue-600 text-white font-black uppercase italic text-[10px] rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mb-3">
                Thanh toán cọc ngay
              </Link>
            )}

            {/*  NÚT BÁO CÁO SỰ CỐ KHẨN CẤP CHỈ HIỆN KHI ĐÃ CỌC (CONFIRMED) */}
            {booking.status === "CONFIRMED" && (
              <button 
                onClick={() => setIsReportOpen(true)} 
                className="w-full py-4 bg-white border-2 border-red-200 text-red-600 shadow-md shadow-red-100 font-black uppercase italic text-[10px] rounded-2xl hover:bg-red-50 hover:border-red-400 transition-all flex items-center justify-center gap-2 group"
              >
                <AlertOctagon size={16} className="group-hover:scale-110 transition-transform"/> Báo cáo sự cố khẩn cấp
              </button>
            )}

            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
              <button 
                onClick={() => alert('Vui lòng quay lại màn hình Lịch sử chuyến đi để thực hiện Hủy đơn!')} 
                className="w-full py-4 mt-2 bg-transparent text-gray-500 font-black uppercase italic text-[10px] rounded-2xl hover:text-red-500 transition-all underline underline-offset-4"
              >
                Yêu cầu hủy chuyến đi thông thường
              </button>
            )}
          </div>
        </div>
      </div>

      {/*  MODAL BÁO CÁO SỰ CỐ KHẨN CẤP */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsReportOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">
              <X size={20}/>
            </button>
            
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertOctagon size={32} />
            </div>
            <h2 className="text-xl font-black text-red-600 uppercase italic text-center mb-2 tracking-tighter">Báo cáo khẩn cấp</h2>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Vui lòng gọi ngay Hotline CSKH của ViVuCar để được hỗ trợ điều phối xe thay thế lập tức.
            </p>
            
            {/* THẺ GỌI HOTLINE */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm">
               <div>
                  <span className="block text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Hotline xử lý sự cố (24/7)</span>
                  <span className="text-xl font-black text-red-700 tracking-widest">1900 8888</span>
               </div>
               <a href="tel:19008888" className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg shadow-red-200 transition-all">
                  <Phone size={20} fill="currentColor"/>
               </a>
            </div>

            {/* FORM GHI NHẬN HỆ THỐNG */}
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block ml-1">Lý do báo cáo sự cố lên hệ thống:</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-bold text-sm outline-none focus:border-red-400 focus:bg-white transition-colors"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">-- Chọn lý do --</option>
                <option value="Chủ xe không giao xe">Chủ xe không đến giao xe</option>
                <option value="Không liên lạc được với chủ xe">Không thể liên lạc được chủ xe</option>
                <option value="Chủ xe yêu cầu phụ phí sai quy định">Chủ xe yêu cầu thêm phụ phí vô lý</option>
                <option value="Xe bị hỏng/Không đúng mô tả">Tình trạng xe không giống mô tả / Không an toàn</option>
              </select>
            </div>

            <button 
              onClick={handleReportIssue}
              disabled={isReporting || !reportReason}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-widest text-[11px] flex justify-center items-center gap-2"
            >
              {isReporting ? <Loader2 className="animate-spin"/> : "Ghi nhận sự cố & Đóng băng cọc"}
            </button>
            <p className="text-[10px] text-gray-400 italic text-center mt-4">
              * Sau khi gửi, đơn hàng sẽ được đưa vào Tranh chấp để bảo vệ quyền lợi và tiền cọc của bạn.
            </p>
          </div>
        </div>
      )}

      {booking && (
        <ReviewModal 
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          bookingId={booking.id}
          carId={booking.carId}
          carName={booking.car?.name || "Chuyến đi"}
          onSuccess={() => {
            fetchBookingDetail(); 
          }}
        />
      )}

    </main>
  );
}
/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardList, CarFront, CheckCircle2, Clock, 
  XCircle, Hourglass, User as UserIcon, Phone, 
  MapPin, ShieldCheck, ChevronDown, ChevronUp, Banknote, FileText,
  Truck, MessageSquare, AlertTriangle, Loader2 
} from "lucide-react";

export default function RecentBookings({ bookings, handleUpdateBookingStatus }) {
  const [visibleCount, setVisibleCount] = useState(4);
  const visibleBookings = bookings.slice(0, visibleCount);

  const [processingId, setProcessingId] = useState(null);
  
  //  STATE ĐỂ QUẢN LÝ THỜI GIAN THỰC (ĐỒNG HỒ ĐẾM NGƯỢC)
  const [currentTime, setCurrentTime] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Cập nhật thời gian mỗi 1 phút để đồng hồ đếm ngược tự nhảy số
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(Date.now());
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 60.000ms = 1 phút
    return () => clearInterval(timer);
  }, []);

  const handleNoShow = async (bookingId) => {
    if (!window.confirm("Xác nhận: Đã quá giờ hẹn nhưng khách không đến nhận xe?\n\nHành động này sẽ HỦY chuyến đi và chuyển tiền đền bù vào ví của bạn. KHÔNG THỂ HOÀN TÁC!")) {
      return;
    }

    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/partner/bookings/${bookingId}/no-show`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Thành công! ${data.message}\nSố tiền nhận: +${data.compensation.toLocaleString('vi-VN')}đ`);
        window.location.reload(); 
      } else {
        alert(data.error || "Có lỗi xảy ra trong quá trình xử lý!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ! Vui lòng thử lại.");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isMounted) return null; // Chống lỗi Hydration của Next.js

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-blue-900 uppercase italic flex items-center gap-2">
            <ClipboardList size={24} className="text-blue-600"/> Đơn hàng của khách
          </h2>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Quản lý việc giao xe và thu tiền còn lại</p>
        </div>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-[32px] shadow-sm">
            <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Bạn chưa có đơn đặt xe nào.</p>
          </div>
        ) : (
          visibleBookings.map((booking) => {
            const remainingAmount = booking.paymentMethod === 'FULL_PAY' 
              ? 0 
              : (booking.totalPrice - (booking.depositAmount || 0));

            // ==========================================================
            //  LOGIC TÍNH TOÁN 15 PHÚT CHỜ ĐỢI
            // ==========================================================
            const startMs = new Date(booking.startDate).getTime();
            const gracePeriodMs = 15 * 60 * 1000; // 15 phút
            const unlockTimeMs = startMs + gracePeriodMs; 
            
            // Đã qua 15 phút chưa?
            const isNoShowEligible = currentTime >= unlockTimeMs;
            
            // Tính số phút còn lại phải đợi
            const minutesLeft = Math.ceil((unlockTimeMs - currentTime) / 60000);

            return (
              <div key={booking.id} className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* CỘT 1: THÔNG TIN KHÁCH & ĐỊA ĐIỂM (Chiếm 5/12) */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-sm">#{booking.id}</span>
                      <h3 className="font-black text-blue-900 text-xl uppercase italic tracking-tighter truncate">{booking.car?.name || "Xe không xác định"}</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-center gap-3">
                        <UserIcon size={16} className="text-gray-400"/> 
                        <span className="font-bold text-gray-800 uppercase text-xs">
                          {booking.customerName || booking.user?.name || "Khách hàng"}
                        </span>
                      </p>
                      
                      {booking.status !== 'PENDING' ? (
                        <p className="flex items-center gap-3 font-bold text-blue-600 text-xs">
                          <Phone size={16}/> {booking.customerPhone || booking.user?.phone || "Chưa cập nhật SĐT"}
                        </p>
                      ) : (
                        <p className="flex items-center gap-3 text-gray-400 italic text-xs"><ShieldCheck size={16}/> Đang ẩn số điện thoại (Chờ cọc)</p>
                      )}

                      {booking.isDelivery ? (
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mt-2">
                          <p className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1.5 mb-1.5">
                            <Truck size={14}/> Yêu cầu giao xe tận nơi
                          </p>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">
                            {booking.deliveryAddress || "Chưa cập nhật địa chỉ giao"}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                          <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                            <MapPin size={14}/> Khách tự đến bãi lấy xe
                          </p>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">
                            {booking.car?.address || booking.car?.location || "Chưa cập nhật địa chỉ xe"}
                          </p>
                        </div>
                      )}

                      {booking.note && (
                        <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-50 mt-2">
                          <MessageSquare size={14} className="mt-0.5 text-blue-400 shrink-0"/>
                          <div>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Lời nhắn từ khách</p>
                            <p className="text-xs text-gray-600 italic leading-relaxed">"{booking.note}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CỘT 2: THANH TOÁN MỚI CHI TIẾT & THỜI GIAN (Chiếm 4/12) */}
                  <div className="lg:col-span-4 flex flex-col justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1.5">
                      <p className="flex items-center gap-2 text-xs font-bold text-green-600"><CheckCircle2 size={14}/> Nhận: {new Date(booking.startDate).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}</p>
                      <p className="flex items-center gap-2 text-xs font-bold text-orange-600"><Clock size={14}/> Trả: {new Date(booking.endDate).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}</p>
                    </div>

                    <div className={`${booking.status === 'PENDING' ? 'bg-gray-50 border-gray-200' : 'bg-emerald-50/30 border-emerald-100'} p-4 rounded-2xl border space-y-3`}>
                      <div className={`flex justify-between items-center border-b ${booking.status === 'PENDING' ? 'border-gray-200' : 'border-emerald-100/50'} pb-2`}>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tổng tiền cuốc</span>
                        <span className="font-bold text-gray-800">{booking.totalPrice?.toLocaleString('vi-VN')}đ</span>
                      </div>
                      
                      {booking.status === 'PENDING' ? (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Chưa thanh toán
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-black text-gray-400 italic tracking-tighter block">
                              0đ
                            </span>
                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">
                              (Chờ cọc: {booking.depositAmount?.toLocaleString('vi-VN')}đ)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                              <Banknote size={12}/> Đã thanh toán
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-700 italic tracking-tighter block">
                                {booking.paymentMethod === 'FULL_PAY' ? booking.totalPrice?.toLocaleString('vi-VN') : booking.depositAmount?.toLocaleString('vi-VN')}đ
                              </span>
                              <span className="text-[9px] font-bold text-gray-500 uppercase">
                                ({booking.paymentMethod === 'FULL_PAY' ? 'Toàn bộ' : 'Tiền cọc'})
                              </span>
                            </div>
                          </div>

                          {remainingAmount > 0 && (
                            <div className="flex justify-between items-center pt-3 border-t border-emerald-100/50 mt-2 bg-red-50/50 -mx-4 -mb-4 p-4 rounded-b-2xl border-x-0 border-b-0 border-red-100">
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Thu thêm khi giao xe</span>
                              <span className="text-xl font-black text-red-600 italic tracking-tighter">
                                {remainingAmount.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* CỘT 3: NÚT TRẠNG THÁI (Chiếm 3/12) */}
                  <div className="lg:col-span-3 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                    {booking.status === 'PENDING' && (
                      <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                        <Hourglass size={24} className="mx-auto text-orange-400 mb-2 animate-pulse" />
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Đang chờ nạp cọc</p>
                      </div>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest text-center bg-green-50 py-2 rounded-xl border border-green-100">Đã cọc thành công</p>
                        
                        <div className="flex flex-col gap-2">
                          <button onClick={() => handleUpdateBookingStatus(booking.id, 'IN_PROGRESS')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md shadow-blue-200 active:scale-95">
                            <CarFront size={16} /> Giao xe
                          </button>

                          {/*  ĐÃ BỔ SUNG: KHÓA NÚT 15 PHÚT */}
                          {isNoShowEligible ? (
                            <button 
                              onClick={() => handleNoShow(booking.id)}
                              disabled={processingId === booking.id}
                              className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              {processingId === booking.id ? (
                                <Loader2 size={16} className="animate-spin text-red-400" />
                              ) : (
                                <AlertTriangle size={16} />
                              )}
                              Khách không đến
                            </button>
                          ) : (
                            <div className="w-full bg-gray-50 text-gray-400 border border-gray-200 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl flex justify-center items-center gap-1.5 cursor-not-allowed select-none">
                              <Clock size={12} />
                              {minutesLeft > 0 ? `Mở nút hủy sau ${minutesLeft} phút` : "Đang mở nút hủy..."}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {booking.status === 'IN_PROGRESS' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center bg-indigo-50 py-2 rounded-xl border border-indigo-100">Đang sử dụng xe</p>
                        <button onClick={() => handleUpdateBookingStatus(booking.id, 'RETURNED')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95">
                          <CheckCircle2 size={16} /> Đã nhận lại xe
                        </button>
                      </div>
                    )}

                    {booking.status === 'RETURNED' && (
                      <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                        <ShieldCheck size={24} className="mx-auto text-green-500 mb-2" />
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Đã thu hồi xe</p>
                        <p className="text-[9px] text-green-600 italic mt-1">Chờ Admin chốt doanh thu</p>
                      </div>
                    )}

                    {booking.status === 'COMPLETED' && (
                      <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <CheckCircle2 size={24} className="mx-auto text-blue-500 mb-2" />
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Hoàn thành</p>
                      </div>
                    )}

                    {booking.status === 'CANCELLED' && (
                      <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-100">
                        <XCircle size={24} className="mx-auto text-red-500 mb-2" />
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Đã hủy</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
      
      {bookings.length > 4 && (
        <div className="mt-8 flex justify-center">
          {visibleCount < bookings.length ? (
            <button onClick={() => setVisibleCount(bookings.length)} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-8 py-3.5 rounded-full transition-all italic border border-blue-100 bg-white shadow-sm">
              Xem tất cả ({bookings.length}) đơn hàng <ChevronDown size={16} />
            </button>
          ) : (
            <button onClick={() => setVisibleCount(4)} className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 px-8 py-3.5 rounded-full transition-all italic border border-gray-200 bg-white shadow-sm">
              Thu gọn danh sách <ChevronUp size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
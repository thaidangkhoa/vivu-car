/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  CheckCircle, XCircle, TrendingUp, Package, 
  ChevronRight, Calendar, Banknote, CheckSquare,
  ShieldCheck, Loader2, Car, MapPin, Phone,
  Truck, MessageSquare, AlertTriangle, AlertOctagon
} from "lucide-react";
import { getBookingState } from "@/lib/bookingUtils"; 

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); 

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (status === "loading") return; 
    
    if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
      router.push("/"); 
      return;
    }

    fetchBookings();
  }, [status, session, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    let actionText = '';
    if (newStatus === 'CANCELLED') actionText = 'HỦY BỎ';
    else if (newStatus === 'IN_PROGRESS') actionText = 'BÀN GIAO XE KHÁCH';
    else if (newStatus === 'RETURNED') actionText = 'THU HỒI XE VỀ';
    
    if (!confirm(`XÁC NHẬN: Bạn muốn ${actionText} đơn hàng này?`)) return;

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ LỖI: ${data.error || "Không thể thực hiện thao tác"}`);
        return;
      }
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi kết nối!");
    }
  };

  const handleCompleteBooking = async (id) => {
    if (!confirm("XÁC NHẬN: Khách đã trả xe và bạn muốn chốt tiền chuyến này?")) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}/complete`, {
        method: "PUT",
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert("✅ Đã chốt đơn thành công!");
        fetchBookings(); 
      } else {
        alert(`❌ LỖI: ${data.error || "Không thể chốt đơn"}`);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối máy chủ!");
    }
  };

  //  HÀM MỚI: XỬ LÝ TRANH CHẤP
  const handleResolveDispute = async (id, actionType) => {
    if (actionType === "REFUND") {
      if (!confirm("CẢNH BÁO: Hành động này sẽ:\n1. Hủy đơn hàng.\n2. Đánh dấu đã hoàn tiền cọc cho khách.\n\nBạn có chắc chắn muốn thực hiện?")) return;
    } else {
      if (!confirm("Xác nhận: Bác bỏ khiếu nại của khách và đưa đơn hàng trở lại trạng thái Đã Cọc?")) return;
    }

    try {
      const res = await fetch(`/api/admin/bookings/${id}/resolve-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType })
      });
      if (res.ok) {
        alert("Đã xử lý tranh chấp thành công!");
        fetchBookings();
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  //  Thêm tab DISPUTED vào bộ lọc
  const filterTabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "DISPUTED", label: "Tranh chấp" },
    { key: "PENDING", label: "Chờ cọc" },
    { key: "CONFIRMED", label: "Chờ giao" },
    { key: "IN_PROGRESS", label: "Đang thuê" },
    { key: "RETURNED", label: "Chờ chốt" },
    { key: "COMPLETED", label: "Đã xong" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === "IN_PROGRESS").length,
    payoutNeeded: bookings.filter(b => b.status === "RETURNED").length,
    disputed: bookings.filter(b => b.status === "DISPUTED").length, // Thêm thống kê tranh chấp
    revenue: bookings.filter(b => b.status === "COMPLETED").reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  const filteredBookings = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-black uppercase tracking-tighter text-blue-900 italic text-[10px]">Đang kết nối kho dữ liệu Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3">
              <Package size={36} className="text-blue-600" /> Quản lý đơn hàng
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 ml-12 tracking-[0.2em]">Hệ thống điều hành ViVuCar</p>
          </div>
          
          <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
            {filterTabs.map((tab) => (
              <button 
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all ${
                  filter === tab.key 
                  ? (tab.key === "DISPUTED" ? "bg-red-600 text-white shadow-lg shadow-red-200" : "bg-blue-600 text-white shadow-lg") 
                  : (tab.key === "DISPUTED" ? "text-red-400 hover:bg-red-50 hover:text-red-700" : "text-gray-400 hover:bg-gray-50 hover:text-blue-900")
                }`}
              >
                {tab.label} ({bookings.filter(b => tab.key === "ALL" ? true : b.status === tab.key).length})
              </button>
            ))}
          </div>
        </div>

        {/* CẢNH BÁO TRANH CHẤP TRÊN ĐẦU */}
        {stats.disputed > 0 && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-3xl mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full text-red-600 animate-pulse">
                <AlertOctagon size={24} />
              </div>
              <div>
                <p className="font-black text-red-700 uppercase tracking-widest text-sm">Cảnh báo hệ thống</p>
                <p className="text-xs text-red-600 font-medium mt-1">Đang có {stats.disputed} đơn hàng bị tranh chấp cần Admin vào phân xử ngay lập tức!</p>
              </div>
            </div>
            <button onClick={() => setFilter("DISPUTED")} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-700 shadow-md">Xem ngay</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xe đang trên đường</p>
              <p className="text-3xl font-black italic text-indigo-600 tracking-tighter">{stats.active} <span className="text-sm font-bold text-gray-300">xe</span></p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Car /></div>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn chờ quyết toán</p>
              <p className="text-3xl font-black italic text-emerald-600 tracking-tighter">{stats.payoutNeeded} <span className="text-sm font-bold text-gray-300">đơn</span></p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><Banknote /></div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-[32px] shadow-xl flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Doanh thu đã chốt</p>
              <p className="text-2xl font-black italic text-white tracking-tighter">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform"><TrendingUp /></div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-6 border-b border-gray-100">Mã đơn</th>
                  <th className="p-6 border-b border-gray-100">Khách hàng</th>
                  <th className="p-6 border-b border-gray-100">Phương tiện & Giao nhận</th>
                  <th className="p-6 border-b border-gray-100">Lịch trình</th>
                  <th className="p-6 border-b border-gray-100">Thanh toán</th>
                  <th className="p-6 border-b border-gray-100 text-center">Trạng thái & Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center text-gray-400 font-bold italic">Không có dữ liệu trong mục này</td></tr>
                ) : filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-6 align-top">
                      <p className="font-black text-blue-900 italic text-lg">#{booking.id}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                    </td>
                    
                    <td className="p-6 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black italic text-xs shrink-0">
                          {(booking.customerName || booking.user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-blue-900 uppercase text-xs italic tracking-tighter line-clamp-1">
                            {booking.customerName || booking.user?.name || "Khách ẩn danh"}
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-0.5">
                            <Phone size={10} className="text-gray-400"/> {booking.customerPhone || booking.user?.phone || "Chưa có SĐT"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-6 min-w-[220px] align-top">
                      <p className="font-black text-blue-600 uppercase italic text-xs tracking-tighter mb-2 line-clamp-1">{booking.car?.name}</p>
                      
                      {booking.isDelivery ? (
                        <div className="bg-orange-50 p-2 rounded-xl border border-orange-100 mb-2">
                          <p className="text-[9px] font-black text-orange-600 uppercase flex items-center gap-1 mb-1"><Truck size={10}/> Giao tận nơi</p>
                          <p className="text-[10px] text-gray-700 font-medium leading-tight line-clamp-2" title={booking.deliveryAddress}>
                            {booking.deliveryAddress}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 mb-2">
                          <p className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1"><MapPin size={10}/> Khách tự đến lấy xe</p>
                        </div>
                      )}

                      {booking.note && (
                        <div className="flex items-start gap-1.5 bg-blue-50/50 p-2 rounded-xl border border-blue-50">
                          <MessageSquare size={10} className="mt-0.5 text-blue-400 shrink-0"/>
                          <p className="text-[10px] text-gray-600 italic line-clamp-2" title={booking.note}>"{booking.note}"</p>
                        </div>
                      )}
                    </td>
                    
                    <td className="p-6 align-top">
                      <div className="flex items-start gap-3 text-gray-500 font-black text-[10px] uppercase italic">
                        <Calendar size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-1.5 mt-0.5">
                          <span className="text-blue-900 tracking-wider">
                            {new Date(booking.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} 
                            <span className="text-gray-400 mx-1">|</span> 
                            {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500 tracking-wider">
                            <ChevronRight size={10} className="text-blue-400 shrink-0" />
                            {new Date(booking.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} 
                            <span className="text-gray-300 mx-1">|</span> 
                            {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6 align-top">
                      {booking.status === "CANCELLED" ? (
                        booking.paymentStatus === "REFUNDED" ? (
                          //  ĐÃ HOÀN TIỀN
                          <div className="bg-gray-100 p-3 rounded-xl border border-gray-300 w-fit">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <CheckCircle size={10}/> Đã Hủy & Hoàn Tiền
                            </p>
                            <p className="font-black text-gray-400 text-sm italic tracking-tighter line-through">
                              Tổng: {formatCurrency(booking.totalPrice)}
                            </p>
                          </div>
                        ) : booking.paymentStatus === "PENDING" ? (
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit opacity-80">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Hủy trước khi cọc</p>
                            <p className="font-black text-gray-400 text-sm italic tracking-tighter line-through">Tổng: {formatCurrency(booking.totalPrice)}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 tracking-widest">Đã thu: 0đ</p>
                          </div>
                        ) : (
                          <div className="bg-red-50 p-3 rounded-xl border border-red-100 w-fit">
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Quá hạn thanh toán</p>
                            <p className="font-black text-red-400 text-sm italic tracking-tighter line-through opacity-80">Tổng: {formatCurrency(booking.totalPrice)}</p>
                          </div>
                        )
                      ) : booking.status === "PENDING" ? (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Chưa thanh toán</p>
                          <p className="font-black text-gray-400 text-sm italic tracking-tighter opacity-80">Tổng: {formatCurrency(booking.totalPrice)}</p>
                          <p className="text-[9px] font-bold text-orange-500 uppercase mt-1 tracking-widest animate-pulse">Chờ cọc: {formatCurrency(booking.depositAmount)}</p>
                        </div>
                      ) : booking.paymentMethod === "FULL_PAY" ? (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 w-fit">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Banknote size={12}/> Đã trả 100%</p>
                          <p className="font-black text-emerald-700 text-sm italic tracking-tighter">{formatCurrency(booking.totalPrice)}</p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 w-fit shadow-sm">
                          <div className="mb-2">
                            <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Đã đặt cọc</p>
                            <p className="font-black text-orange-700 text-xs italic tracking-tighter">{booking.depositAmount > 0 ? formatCurrency(booking.depositAmount) : "---"}</p>
                          </div>
                          <div className="h-px w-full bg-orange-200/60 mb-2"></div>
                          <div>
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Thu thêm khi giao</p>
                            <p className="font-black text-red-600 text-sm italic tracking-tighter">{formatCurrency((booking.totalPrice || 0) - (booking.depositAmount || 0))}</p>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-6 text-center align-top">
                      {(() => {
                        const state = getBookingState(booking);
                        return (
                          <div className="flex flex-col items-center gap-2">
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic border ${state.badgeClass}`}>
                              {state.text}
                            </span>

                            {/* NẾU TRANH CHẤP -> HIỆN NÚT XỬ LÝ */}
                            {booking.status === 'DISPUTED' && (
                              <div className="mt-3 bg-red-50 p-3 rounded-xl border border-red-200 w-56 text-left shadow-sm">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 mb-1"><AlertTriangle size={10}/> Lý do từ khách:</p>
                                <p className="text-xs font-medium text-red-800 mb-3 line-clamp-3 bg-white p-2 rounded-lg border border-red-100">{booking.issueReport}</p>
                                <div className="flex flex-col gap-2">
                                  <button onClick={() => handleResolveDispute(booking.id, 'REFUND')} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md transition-all">Hoàn tiền khách</button>
                                  <button onClick={() => handleResolveDispute(booking.id, 'IGNORE')} className="w-full bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Bác bỏ (Bỏ qua)</button>
                                </div>
                              </div>
                            )}
                            
                            {state.canAdminAction && booking.status === 'PENDING' && (
                              <div className="flex gap-2 w-full mt-2 justify-center">
                                <button onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')} className="w-full bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest" title="Hủy đơn">
                                  <XCircle size={12} /> Hủy bỏ
                                </button>
                              </div>
                            )}

                            {booking.car?.ownerType === "COMPANY" && booking.status === 'CONFIRMED' && (
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}
                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl transition-all shadow-md active:scale-95 font-black text-[9px] uppercase tracking-widest"
                              >
                                Bàn giao xe
                              </button>
                            )}

                            {booking.car?.ownerType === "COMPANY" && booking.status === 'IN_PROGRESS' && (
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'RETURNED')}
                                className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-3 rounded-xl transition-all shadow-md active:scale-95 font-black text-[9px] uppercase tracking-widest"
                              >
                                Thu hồi xe
                              </button>
                            )}

                            {booking.status === 'RETURNED' && (
                              <button 
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="mt-2 w-full flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 px-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest"
                              >
                                <CheckSquare size={14} /> Chốt doanh thu
                              </button>
                            )}

                            {booking.status === 'COMPLETED' && (
                              <div className="mt-2 w-full flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 py-2 px-3 rounded-xl font-black text-[9px] uppercase tracking-widest">
                                <ShieldCheck size={14} /> Hoàn tất
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
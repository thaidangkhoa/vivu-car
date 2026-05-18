/* eslint-disable */
// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; 
import { ShieldCheck, Clock, Wallet, ArrowRight, Loader2, ClipboardList, CarFront } from "lucide-react";
import { useRouter } from "next/navigation";
import MyFleet from "./components/MyFleet";
import RecentBookings from "./components/RecentBookings";

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const userName = session?.user?.name || "Đối tác";

  const [myCars, setMyCars] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0); 
  const [bookings, setBookings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("BOOKINGS"); 

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/?auth=login&callback=/partner/dashboard");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [carsRes, walletRes, bookingsRes] = await Promise.all([
          fetch('/api/partner/cars'),
          fetch('/api/partner/wallet'),
          fetch('/api/partner/bookings') 
        ]);
  
        if (carsRes.ok) {
           const carsData = await carsRes.json();
           if (carsData.success) setMyCars(carsData.cars);
        }
  
        if (walletRes.ok) {
           const walletData = await walletRes.json();
           if (walletData.success) setWalletBalance(walletData.wallet.balance);
        }

        if (bookingsRes.ok) {
           const bookingsData = await bookingsRes.json();
           if (bookingsData.success) setBookings(bookingsData.bookings);
        }
      } catch (error) {
        console.error("LỖI TẢI DỮ LIỆU DASHBOARD:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [status, router]);

  const handleDeleteCar = async (carId: number, carName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN xe ${carName} không?\nKhuyến nghị: Nên sử dụng tính năng "Tạm Ẩn" để không mất dữ liệu.`)) return;

    try {
      const res = await fetch(`/api/cars/${carId}`, { method: "DELETE" });
      if (res.ok) {
        alert("Đã xóa xe thành công!");
        setMyCars(prev => prev.filter(c => c.id !== carId)); 
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  //  MỚI: Hàm xử lý Tạm ẩn / Mở lại xe
  const handleToggleCarStatus = async (carId: number, currentStatus: string, carName: string) => {
    const newStatus = currentStatus === 'APPROVED' ? 'HIDDEN' : 'APPROVED';
    const actionText = newStatus === 'HIDDEN' ? 'TẠM DỪNG HOẠT ĐỘNG' : 'MỞ LẠI HOẠT ĐỘNG';
    const warningText = newStatus === 'HIDDEN' 
      ? `Xe ${carName} sẽ bị ẨN KHỎI TRANG CHỦ và khách không thể thuê nữa.` 
      : `Xe ${carName} sẽ được HIỂN THỊ LẠI trên trang chủ.`;

    if (!window.confirm(`Xác nhận: ${actionText}?\n${warningText}`)) return;

    try {
      const res = await fetch(`/api/partner/cars/${carId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(`✅ Đã ${newStatus === 'HIDDEN' ? 'tạm ẩn' : 'mở lại'} xe thành công!`);
        // Tự động cập nhật lại danh sách xe mà không cần tải lại trang
        setMyCars(prev => prev.map(c => c.id === carId ? { ...c, status: newStatus } : c)); 
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    const actionName = newStatus === 'IN_PROGRESS' ? 'Xác nhận đã GIAO XE cho khách' : 'Xác nhận đã NHẬN LẠI XE an toàn';
    if(!window.confirm(`Xác nhận hành động: ${actionName}?`)) return;

    try {
      const res = await fetch(`/api/partner/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus })
      });

      if (res.ok) {
        alert(`Thành công! Trạng thái đơn hàng #${bookingId} đã được cập nhật.`);
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const approvedCount = myCars.filter(c => c.status === "APPROVED").length;
  const pendingCount = myCars.filter(c => c.status === "PENDING").length;

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-blue-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-[10px] italic">Hệ thống đang đồng bộ dữ liệu đối tác...</p>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-24 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">
              Trung tâm đối tác
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter">
            Xin chào, {userName}!
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">
            Quản lý đội xe và theo dõi doanh thu của bạn tại ViVuCar.
          </p>
        </div>

        {/* THỐNG KÊ (WIDGETS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Xe đang hoạt động</p>
              <h3 className="text-3xl font-black text-blue-900">{approvedCount}</h3>
            </div>
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Đang chờ duyệt</p>
              <h3 className="text-3xl font-black text-yellow-600">{pendingCount}</h3>
            </div>
            <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center">
              <Clock size={28} />
            </div>
          </div>

          <Link 
            href="/partner/wallet" 
            className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-[24px] shadow-lg shadow-blue-200 flex flex-col justify-center items-start text-white relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all block"
          >
            <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform group-hover:scale-110 transition-all duration-500" />
            <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-1 relative z-10">Số dư ví</p>
            <h3 className="text-2xl font-black relative z-10">{(walletBalance || 0).toLocaleString('vi-VN')}đ</h3>
            <div className="mt-2 text-[10px] font-bold text-blue-100 flex items-center gap-1 relative z-10">
              Chạm để rút tiền <ArrowRight size={12} />
            </div>
          </Link>
        </div>

        {/* TABS CHUYỂN ĐỔI */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-fit mb-8 animate-in fade-in duration-700">
          <button 
            onClick={() => setActiveTab("BOOKINGS")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic ${
              activeTab === "BOOKINGS" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <ClipboardList size={16} /> Đơn hàng gần đây ({bookings.length})
          </button>
          <button 
            onClick={() => setActiveTab("FLEET")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic ${
              activeTab === "FLEET" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <CarFront size={16} /> Đội xe của tôi ({myCars.length})
          </button>
        </div>

        {/* NỘI DUNG HIỂN THỊ DỰA VÀO TAB */}
        {activeTab === "BOOKINGS" ? (
          <RecentBookings bookings={bookings} handleUpdateBookingStatus={handleUpdateBookingStatus} />
        ) : (
          //  Truyền thêm handleToggleCarStatus vào MyFleet
          <MyFleet myCars={myCars} handleDeleteCar={handleDeleteCar} handleToggleCarStatus={handleToggleCarStatus} />
        )}

      </div>
    </main>
  );
}
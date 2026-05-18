/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, AlertOctagon, CarFront, ClipboardList, 
  CreditCard, MessageSquare, RefreshCcw, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; //  MỚI: Dùng để nhận biết khi Admin chuyển trang

export default function AdminNotificationBell() {
  const [data, setData] = useState({ 
    disputedBookings: 0, pendingCars: 0, pendingBookings: 0, 
    pendingRefunds: 0, pendingWithdrawals: 0, pendingContacts: 0, total: 0 
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); //  Bắt sự kiện đổi URL

  // Đưa logic fetch ra ngoài để tái sử dụng
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications/count");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo", error);
    }
  };

  //  1. LẤY DỮ LIỆU ĐỊNH KỲ VÀ KHI CHUYỂN TRANG
  useEffect(() => {
    fetchNotifications(); // Gọi ngay khi load hoặc khi pathname thay đổi
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [pathname]); // <--- Mỗi lần Admin click link đổi trang, chuông tự động cập nhật lại số!

  //  2. CẬP NHẬT NGAY LẬP TỨC KHI ADMIN QUAY LẠI TRÌNH DUYỆT
  useEffect(() => {
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell size={24} className={data.total > 0 ? "text-blue-600" : ""} />
        
        {data.total > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white border-2 border-white animate-bounce shadow-md">
            {data.total > 9 ? "9+" : data.total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 mb-2">
            <span className="font-black text-blue-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Bell size={14}/> Việc cần xử lý
            </span>
            <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-1 rounded-md font-bold">
              {data.total} Việc
            </span>
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {data.total === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <CheckCircle2 size={40} className="text-green-300 mb-2"/>
                <p className="text-xs font-bold uppercase tracking-widest">Hệ thống ổn định</p>
                <p className="text-[10px] mt-1">Bạn đã hoàn thành mọi công việc!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 px-2">
                
                {data.disputedBookings > 0 && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-3 hover:bg-red-50 rounded-2xl transition-colors group border border-transparent hover:border-red-100">
                    <div className="bg-red-100 p-2.5 rounded-xl text-red-600 shrink-0 group-hover:scale-110 transition-transform"><AlertOctagon size={18}/></div>
                    <div>
                      <p className="text-xs font-black text-red-600 uppercase tracking-tight">Tranh chấp khẩn cấp</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">Có <strong className="text-red-500">{data.disputedBookings}</strong> khiếu nại từ khách. Cần phân xử ngay!</p>
                    </div>
                  </Link>
                )}

                {data.pendingRefunds > 0 && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-3 hover:bg-pink-50 rounded-2xl transition-colors group border border-transparent hover:border-pink-100">
                    <div className="bg-pink-100 p-2.5 rounded-xl text-pink-600 shrink-0 group-hover:scale-110 transition-transform"><RefreshCcw size={18}/></div>
                    <div>
                      <p className="text-xs font-black text-pink-600 uppercase tracking-tight">Hủy đơn & Hoàn tiền</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">Có <strong className="text-pink-500">{data.pendingRefunds}</strong> đơn khách đã hủy chờ bạn duyệt hoàn cọc.</p>
                    </div>
                  </Link>
                )}

                {data.pendingWithdrawals > 0 && (
                  <Link href="/admin/withdrawals" onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-3 hover:bg-purple-50 rounded-2xl transition-colors group border border-transparent hover:border-purple-100">
                    <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 shrink-0 group-hover:scale-110 transition-transform"><CreditCard size={18}/></div>
                    <div>
                      <p className="text-xs font-black text-purple-600 uppercase tracking-tight">Duyệt rút tiền</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">Có <strong className="text-purple-500">{data.pendingWithdrawals}</strong> yêu cầu rút doanh thu từ đối tác.</p>
                    </div>
                  </Link>
                )}

                {data.pendingBookings > 0 && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-3 hover:bg-blue-50 rounded-2xl transition-colors group border border-transparent hover:border-blue-100">
                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shrink-0 group-hover:scale-110 transition-transform"><ClipboardList size={18}/></div>
                    <div>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-tight">Đơn đặt xe mới</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">Có <strong className="text-blue-500">{data.pendingBookings}</strong> chuyến đi mới khách hàng vừa đặt.</p>
                    </div>
                  </Link>
                )}

                {data.pendingCars > 0 && (
                  <Link href="/admin/approve-cars" onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-3 hover:bg-orange-50 rounded-2xl transition-colors group border border-transparent hover:border-orange-100">
                    <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 shrink-0 group-hover:scale-110 transition-transform"><CarFront size={18}/></div>
                    <div>
                      <p className="text-xs font-black text-orange-600 uppercase tracking-tight">Hồ sơ đối tác mới</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">Có <strong className="text-orange-500">{data.pendingCars}</strong> xe chờ duyệt pháp lý.</p>
                    </div>
                  </Link>
                )}

                {data.pendingContacts > 0 && (
                  <Link href="/admin/contacts" onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-3 hover:bg-teal-50 rounded-2xl transition-colors group border border-transparent hover:border-teal-100">
                    <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600 shrink-0 group-hover:scale-110 transition-transform"><MessageSquare size={18}/></div>
                    <div>
                      <p className="text-xs font-black text-teal-600 uppercase tracking-tight">Yêu cầu hỗ trợ</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">Có <strong className="text-teal-500">{data.pendingContacts}</strong> tin nhắn cần Admin phản hồi.</p>
                    </div>
                  </Link>
                )}
                
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
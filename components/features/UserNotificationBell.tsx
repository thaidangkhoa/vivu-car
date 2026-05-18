/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Clock, Car, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function UserNotificationBell() {
  const [data, setData] = useState({ pendingBookings: [], upcomingTrips: [], resolvedDisputes: [], total: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [clickedIds, setClickedIds] = useState([]); //  BỘ NHỚ LƯU TRỮ CÁC THÔNG BÁO ĐÃ CLICK
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Khởi tạo đọc danh sách đã click từ LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('vivucar_user_read_notifications');
    if (saved) {
      setClickedIds(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/user/notifications");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Lỗi tải thông báo", error);
      }
    };

    fetchNotifications(); 
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRemainingMinutes = (createdAtStr) => {
    const createdAt = new Date(createdAtStr).getTime();
    const expiryTime = createdAt + 20 * 60 * 1000; 
    const diff = Math.floor((expiryTime - currentTime) / 60000);
    return diff > 0 ? diff : 0;
  };

  //  HÀM MỚI: XỬ LÝ KHI CLICK VÀO THÔNG BÁO
  const handleNotificationClick = (uniqueId) => {
    setIsOpen(false);
    
    // Nếu chưa click bao giờ thì thêm vào danh sách
    if (!clickedIds.includes(uniqueId)) {
      const newClickedIds = [...clickedIds, uniqueId];
      setClickedIds(newClickedIds);
      localStorage.setItem('vivucar_user_read_notifications', JSON.stringify(newClickedIds));
    }
  };

  //  TÍNH TOÁN LẠI SỐ LƯỢNG THÔNG BÁO THỰC TẾ CHƯA ĐỌC
  const unreadCount = [
    ...data.pendingBookings.map(b => `pending_${b.id}`),
    ...data.upcomingTrips.map(t => `upcoming_${t.id}`),
    ...data.resolvedDisputes.map(d => `dispute_${d.id}`)
  ].filter(id => !clickedIds.includes(id)).length;


  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-blue-900 bg-white/50 hover:bg-white rounded-full transition-all border border-blue-100 shadow-sm"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-blue-600 fill-blue-600/20" : ""} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-white shadow-sm animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-white rounded-[24px] shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center mb-2">
            <span className="font-black text-blue-900 uppercase text-[11px] tracking-widest flex items-center gap-2">
              Thông báo của bạn
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {data.total === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <Bell size={40} className="text-gray-200 mb-2"/>
                <p className="text-xs font-bold uppercase tracking-widest">Không có thông báo mới</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 px-2">
                
                {data.pendingBookings.map(booking => {
                  const minsLeft = getRemainingMinutes(booking.createdAt);
                  if (minsLeft === 0) return null; 
                  const uid = `pending_${booking.id}`;
                  const isRead = clickedIds.includes(uid);
                  
                  return (
                    <Link key={booking.id} href={`/payment/${booking.id}`} onClick={() => handleNotificationClick(uid)} className={`flex items-start gap-3 p-3 rounded-2xl transition-colors group border border-transparent hover:border-orange-100 ${isRead ? 'opacity-60' : 'hover:bg-orange-50 bg-orange-50/50'}`}>
                      <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 shrink-0"><Clock size={18}/></div>
                      <div>
                        <p className="text-xs font-black text-orange-600 uppercase tracking-tight">Cần thanh toán cọc {isRead ? '' : <span className="text-[8px] bg-red-500 text-white px-1.5 rounded ml-1">MỚI</span>}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">Đơn thuê xe <strong className="text-gray-800">{booking.car?.name}</strong> của bạn sẽ bị hủy sau <strong className="text-red-500">{minsLeft} phút</strong> nữa. Thanh toán ngay!</p>
                      </div>
                    </Link>
                  );
                })}

                {data.upcomingTrips.map(trip => {
                  const hoursUntilStart = (new Date(trip.startDate).getTime() - currentTime) / (1000 * 60 * 60);
                  const isSoon = hoursUntilStart <= 24; 
                  const uid = `upcoming_${trip.id}`;
                  const isRead = clickedIds.includes(uid);

                  return (
                    <Link key={trip.id} href={`/history/${trip.id}`} onClick={() => handleNotificationClick(uid)} className={`flex items-start gap-3 p-3 rounded-2xl transition-colors group border border-transparent ${isRead ? 'opacity-60' : (isSoon ? 'hover:bg-indigo-50 bg-indigo-50/50 hover:border-indigo-100' : 'hover:bg-blue-50 bg-blue-50/50 hover:border-blue-100')}`}>
                      <div className={`${isSoon ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'} p-2.5 rounded-xl shrink-0`}>
                        <Car size={18}/>
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-tight ${isSoon ? 'text-indigo-600' : 'text-blue-600'}`}>
                          {isSoon ? "Sắp đến giờ nhận xe" : "Đặt xe thành công"} {isRead ? '' : <span className="text-[8px] bg-red-500 text-white px-1.5 rounded ml-1">MỚI</span>}
                        </p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                          Chuyến đi với <strong className="text-gray-800">{trip.car?.name}</strong> đã được xác nhận. {isSoon ? 'Bạn nhớ đến nhận xe lúc' : 'Lịch nhận xe vào lúc'} <strong className={isSoon ? 'text-indigo-600' : 'text-blue-600'}>{new Date(trip.startDate).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'})}</strong>.
                        </p>
                      </div>
                    </Link>
                  );
                })}

                {data.resolvedDisputes.map(dispute => {
                  const uid = `dispute_${dispute.id}`;
                  const isRead = clickedIds.includes(uid);

                  return (
                    <Link key={dispute.id} href={`/history/${dispute.id}`} onClick={() => handleNotificationClick(uid)} className={`flex items-start gap-3 p-3 rounded-2xl transition-colors group border border-transparent hover:border-emerald-100 ${isRead ? 'opacity-60' : 'hover:bg-emerald-50 bg-emerald-50/50'}`}>
                      <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0"><CheckCircle2 size={18}/></div>
                      <div>
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-tight">Khiếu nại đã xử lý {isRead ? '' : <span className="text-[8px] bg-red-500 text-white px-1.5 rounded ml-1">MỚI</span>}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">Hệ thống đã giải quyết khiếu nại và <strong className="text-emerald-600">hoàn tiền cọc</strong> cho đơn xe {dispute.car?.name}.</p>
                      </div>
                    </Link>
                  )
                })}
                
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
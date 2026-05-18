/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; 
import { useRouter, useSearchParams, usePathname } from "next/navigation"; 
import { useSession, signOut } from "next-auth/react"; 
import { 
  User, LogOut, ChevronDown, Car, CarFront, Lock, 
  Settings, LayoutDashboard, CalendarDays, Gift, Home,
  ShieldCheck, MapPin, Info, Clock, Calendar, Handshake, BarChart3, MessageSquare
} from "lucide-react";
import AuthModal from "@/components/features/AuthModal"; 

//  IMPORT COMPONENT CHUÔNG THÔNG BÁO DÀNH CHO USER
import UserNotificationBell from "@/components/features/UserNotificationBell";

export default function Navbar() {
  //  1. KHAI BÁO TẤT CẢ HOOKS Ở ĐẦY TIÊN (Rules of Hooks)
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy dữ liệu từ Session Cookie của NextAuth
  const { data: session, status } = useSession();
  const user = session?.user;

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isMounted, setIsMounted] = useState(false);

  // Tránh lỗi Hydration (lệch giao diện Server và Client)
  useEffect(() => {
    setIsMounted(true);
    
    // Tự động mở Modal nếu URL có ?auth=login
    if (searchParams.get("auth") === "login") {
      setAuthMode("login");
      setShowAuthModal(true);
    }
  }, [searchParams]);

  //  2. ĐẶT EARLY RETURN Ở ĐÂY (SAU KHI ĐÃ GỌI HẾT HOOKS)
  // Nếu đang ở đường dẫn /admin... thì ẩn Navbar này đi
  if (pathname?.startsWith("/admin")) {
    return null; 
  }

  //  3. CÁC HÀM XỬ LÝ SỰ KIỆN
  const handleLogout = async () => {
    setShowDropdown(false);
    // Xóa nốt localStorage nếu lỡ còn sót rác cũ
    localStorage.removeItem("user"); 
    await signOut({ callbackUrl: "/" }); 
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (!isMounted) return <nav className="h-16 bg-white border-b shadow-sm" />;

  //  4. KẾT QUẢ RENDER (JSX)
  return (
    <>
      <nav className="print:hidden bg-white/90 border-b sticky top-0 z-[100] shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* LOGO VI VU CAR */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200 group-hover:rotate-6 transition-all">
              <Car size={22} />
            </div>
            <span className="text-xl font-black text-blue-900 tracking-tighter uppercase italic">ViVuCar</span>
          </Link>

          {/* MENU CHÍNH */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1.5 rounded-full text-[10px] font-black uppercase italic text-gray-400 tracking-widest">
              
              <Link href="/" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <Home size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Trang chủ
              </Link>

              <Link href="/cars" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <Car size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Toàn bộ xe
              </Link>

              <Link href="/#brand-section" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <ShieldCheck size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Thương hiệu
              </Link>

              <Link href="/#location-section" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <MapPin size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Địa điểm
              </Link>

              <Link href="/about" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <Info size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Về chúng tôi
              </Link>

              <Link href="/promotions" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <Gift size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Ưu đãi
              </Link>

              <Link href="/partner" className="px-3 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-300 flex items-center gap-1.5 group">
                <CarFront size={14} className="mb-0.5 text-gray-400 group-hover:text-blue-500 transition-colors" /> Hợp tác chủ xe
              </Link>

            </div>         
          </div>

          {/* CỤM TÀI KHOẢN */}
          <div className="flex items-center gap-2">
            {status === "authenticated" && user ? (
              <>
                {/*  GẮN COMPONENT CHUÔNG VÀO NGAY TRƯỚC AVATAR CỦA USER */}
                <UserNotificationBell />

                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-50 transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-xs italic shadow-md">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col items-start pr-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-0.5">Thành viên</span>
                      <span className="text-xs font-black text-blue-900 uppercase italic tracking-tighter max-w-[100px] truncate">
                        {user.name}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-blue-900 transition-transform duration-300 mr-2 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                      <div className="absolute right-0 mt-4 w-[280px] bg-white border border-gray-100 rounded-[24px] shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100 mb-3">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bảng điều khiển</p>
                        </div>

                        <div className="px-3 flex flex-col gap-2 mb-3">
                          {/* 1. KHU VỰC CHO ADMIN */}
                          {user.role === "ADMIN" && (
                            <>
                              <Link href="/admin" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                                <LayoutDashboard size={18} /> QUẢN TRỊ ĐƠN HÀNG
                              </Link>
                              <Link href="/admin/cars" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                                <CarFront size={18} /> QUẢN TRỊ ĐỘI XE
                              </Link>
                              <Link href="/admin/promotions" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                                <Gift size={18} /> QUẢN TRỊ MÃ ƯU ĐÃI
                              </Link>
                              <Link href="/admin/approve-cars" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                                <Handshake size={18} /> QUẢN LÝ HỢP TÁC
                              </Link>
                              <Link href="/admin/reports" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                                <BarChart3 size={18} /> THỐNG KÊ VÀ DOANH THU
                              </Link>
                              <Link href="/admin/contacts" className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                                <MessageSquare size={18} /> YÊU CẦU HỖ TRỢ
                              </Link>
                            </>
                          )}

                          {/* 2. MENU ĐỐI TÁC CHỦ XE */}
                          <Link href="/partner/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all rounded-xl border border-blue-100 uppercase italic">
                             <LayoutDashboard size={18} /> QUẢN LÝ XE CHO THUÊ
                          </Link>
                          
                          {/* 3. KHU VỰC CHUNG CHO USER */}
                          <Link href="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl border border-gray-100 uppercase italic">
                            <CalendarDays size={18} /> Chuyến đi của tôi
                          </Link>
                          <Link href="/profile/info" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3.5 text-[10px] font-black text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl border border-gray-100 uppercase italic">
                            <User size={18} /> Thông tin cá nhân
                          </Link>
                          
                        </div>

                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black text-red-500 bg-red-50/50 hover:bg-red-500 hover:text-white transition-all uppercase italic tracking-widest border-t border-red-50">
                          <LogOut size={16} /> Thoát hệ thống
                        </button>

                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => openAuth('login')} className="text-xs font-black text-blue-900 uppercase italic px-5 py-2.5 transition-all hover:bg-blue-50 rounded-xl">Đăng nhập</button>
                <button onClick={() => openAuth('register')} className="bg-blue-600 text-white text-xs font-black px-7 py-3 rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-100 transition-all active:scale-95 uppercase italic tracking-tighter">Đăng ký</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL ĐĂNG NHẬP/ĐĂNG KÝ */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => {
            setShowAuthModal(false);
            router.refresh(); 
          }} 
          initialMode={authMode} 
        />
      )}
    </>
  );
}
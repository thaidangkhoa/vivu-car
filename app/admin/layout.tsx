/* eslint-disable */
// @ts-nocheck
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ClipboardList, CarFront, Handshake, 
  Gift, BarChart3, LogOut, ShieldCheck, MessageSquare
} from "lucide-react";

//  IMPORT COMPONENT CÁI CHUÔNG THÔNG BÁO VỪA TẠO
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. KIỂM TRA BẢO MẬT (Server Side)
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/"); 
  }

  const adminMenus = [
    { name: "Quản lý Đơn hàng", icon: <ClipboardList size={20} />, path: "/admin" },
    { name: "Quản lý Đội xe", icon: <CarFront size={20} />, path: "/admin/cars" },
    { name: "Quản lý Hợp tác", icon: <Handshake size={20} />, path: "/admin/approve-cars" },
    { name: "Quản lý Mã ưu đãi", icon: <Gift size={20} />, path: "/admin/promotions" },
    { name: "Thống kê & Doanh thu", icon: <BarChart3 size={20} />, path: "/admin/reports" },
    { name: "Yêu cầu hỗ trợ", icon: <MessageSquare size={20} />, path: "/admin/contacts" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-blue-800/50 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-white text-blue-900 p-1.5 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter">Admin Panel</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 pl-2">Quản trị hệ thống</p>
          
          {adminMenus.map((menu, index) => (
            <Link 
              key={index} 
              href={menu.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-all group"
            >
              <div className="text-blue-300 group-hover:text-white transition-colors">
                {menu.icon}
              </div>
              <span className="uppercase tracking-widest text-[11px] mt-0.5">{menu.name}</span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-blue-800/50">
          <Link 
            href="/api/auth/signout" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-300 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span className="uppercase tracking-widest text-[11px] mt-0.5">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className="h-20 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div>
            <h2 className="text-lg font-black text-blue-900 uppercase italic tracking-tighter">
              Hệ thống điều hành ViVuCar
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Live Real-time Server
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/*  GẮN COMPONENT CHUÔNG THÔNG BÁO VÀO ĐÂY */}
            <AdminNotificationBell />

            {/* ĐƯỜNG KẺ DỌC PHÂN CÁCH */}
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-blue-900 uppercase tracking-widest">{session.user.name || "Quản trị viên"}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Đang hoạt động
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black italic shadow-inner">
                {(session.user.name || "A")[0]}
              </div>
            </div>

          </div>
        </header>

        {/* CÁC TRANG CON HIỂN THỊ Ở ĐÂY */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}
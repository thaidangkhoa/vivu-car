/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Car, PhoneCall, Mail, MapPin, Facebook, 
  Youtube, Instagram, Linkedin, ChevronRight, ShieldCheck, Sparkles 
} from "lucide-react";

// Khai báo mảng 12 địa điểm
const FOOTER_LOCATIONS = [
  { name: "Hà Nội", value: "HaNoi" },
  { name: "TP. Hồ Chí Minh", value: "TPHCM" },
  { name: "Đà Nẵng", value: "DaNang" },
  { name: "Nha Trang", value: "NhaTrang" },
  { name: "Phú Quốc", value: "PhuQuoc" },
  { name: "Đà Lạt", value: "DaLat" },
  { name: "Hạ Long", value: "HaLong" },
  { name: "Vũng Tàu", value: "VungTau" },
  { name: "Cần Thơ", value: "CanTho" },
  { name: "Hội An", value: "HoiAn" },
  { name: "Huế", value: "Hue" },
  { name: "Quy Nhơn", value: "QuyNhon" },
];

//  THÊM MỚI: Khai báo mảng Chính sách với đường dẫn URL thật
const POLICY_LINKS = [
  { name: "Điều kiện giao dịch chung", href: "/policies/terms" },
  { name: "Chính sách bảo mật dữ liệu", href: "/policies/privacy" },
  { name: "Điều khoản sử dụng nền tảng", href: "/policies/platform-terms" }, // Trỏ về bản mẫu hợp đồng bạn vừa làm
  { name: "Chính sách giao nhận xe", href: "/policies/delivery" },
  { name: "Phương thức thanh toán", href: "/policies/payment" },
];

export default function Footer() {
  const pathname = usePathname();

  // Ẩn Footer ở trang Admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="print:hidden bg-white border-t border-gray-100 pt-20 pb-8 font-sans relative overflow-hidden">
      
      {/* Đốm sáng mờ trang trí */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -bottom-[50%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[50%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* CỘT 1: BRANDING & GIỚI THIỆU */}
          <div className="lg:col-span-3 space-y-6">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-200 group-hover:rotate-6 transition-all">
                <Car size={26} />
              </div>
              <span className="text-3xl font-black text-blue-900 tracking-tighter uppercase italic">
                AutoHub <span className="text-blue-600">AI</span>
              </span>
            </Link>
            
            <p className="text-gray-500 font-medium leading-relaxed text-sm">
              Nền tảng đặt xe tự lái tích hợp trí tuệ nhân tạo hàng đầu. Mang đến trải nghiệm di chuyển thông minh, minh bạch và đẳng cấp.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-gray-600 font-medium text-sm">
                <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Hải Châu, Đà Nẵng</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                <PhoneCall size={18} className="text-blue-600 shrink-0" />
                <span className="font-black text-blue-900 text-lg tracking-tight italic">1900 8888</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                <Mail size={18} className="text-blue-600 shrink-0" />
                <span>cskh@autohub.vn</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: CHÍNH SÁCH (ĐÃ SỬA LỖI LINK) */}
          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Chính sách & Điều khoản
            </h3>
            <ul className="space-y-4">
              {POLICY_LINKS.map((item, index) => (
                <li key={index}>
                  {/*  Thay href="#" bằng href={item.href} và dùng item.name */}
                  <Link href={item.href} className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-all flex items-center gap-2 group">
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: ĐỊA ĐIỂM DỊCH VỤ */}
          <div className="lg:col-span-4">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <MapPin size={14} /> Mạng lưới 12 Tỉnh/Thành
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {FOOTER_LOCATIONS.map((loc, index) => (
                <li key={index}>
                  <Link 
                    href={`/cars?location=${loc.value}`} 
                    className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-all flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-blue-600 transition-colors"></div>
                    {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 4: MẠNG XÃ HỘI & CHỨNG NHẬN */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles size={14} /> Kết nối
            </h3>
            
            <div className="grid grid-cols-4 gap-2 mb-8">
              <Link href="https://facebook.com" target="_blank" className="w-10 h-10 rounded-2xl bg-gray-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-200">
                <Facebook size={18} />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="w-10 h-10 rounded-2xl bg-gray-50 text-blue-800 flex items-center justify-center hover:bg-blue-800 hover:text-white transition-all shadow-sm hover:shadow-blue-200">
                <Linkedin size={18} />
              </Link>
              <Link href="https://youtube.com" target="_blank" className="w-10 h-10 rounded-2xl bg-gray-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-200">
                <Youtube size={18} />
              </Link>
              <Link href="https://instagram.com" target="_blank" className="w-10 h-10 rounded-2xl bg-gray-50 text-pink-600 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all shadow-sm hover:shadow-pink-200">
                <Instagram size={18} />
              </Link>
            </div>

            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Chứng nhận</h3>
            <Link href="http://online.gov.vn" target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-blue-50 hover:border-blue-100 transition-all group">
              <ShieldCheck className="text-blue-600 w-8 h-8 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-tighter italic leading-none mb-1">Đã thông báo</p>
                <p className="text-xs font-bold text-gray-600 uppercase group-hover:text-blue-600 transition-colors">Bộ Công Thương</p>
              </div>
            </Link>
          </div>

        </div>
        
        {/* ĐƯỜNG KẺ VÀ COPYRIGHT (ĐÃ SỬA LỖI LINK Ở GÓC DƯỚI) */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CÔNG TY TNHH AUTOHUB VIỆT NAM. MST: 0123456789.</p>
          <div className="flex items-center gap-6">
            <Link href="/policies/platform-terms" className="hover:text-blue-600 transition-colors">Điều khoản</Link>
            <Link href="/policies/privacy" className="hover:text-blue-600 transition-colors">Bảo mật</Link>
            <Link href="/sitemap" className="hover:text-blue-600 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
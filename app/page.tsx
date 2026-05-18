/* eslint-disable */
// @ts-nocheck
import prisma from "@/lib/prisma"; 
import HeroBanner from "@/components/features/HeroBanner";
import SearchWidget from "@/components/features/SearchWidget";
import CarSection from "@/components/features/CarSection";
import BrandList from "@/components/features/BrandList";
import LocationList from "@/components/features/LocationList";
import HomeReviews from "@/components/features/HomeReviews";
import FaqSection from "@/components/features/FaqSection";
import Link from "next/link";

import { 
  ArrowRight, Sparkles, CarFront, Award, Map, MessageSquare, 
  HelpCircle, Compass, Smartphone, Key, MapPin, Star, ShieldCheck, 
  CalendarCheck, FileText, CreditCard, Wallet, BadgeCheck, Briefcase
} from "lucide-react"; 

// ==========================================
// DATA HƯỚNG DẪN THUÊ XE
// ==========================================
const RENT_STEPS = [
  { num: "01", title: "Tìm & Đặt chuyến", desc: "Lựa chọn xe ưng ý, thời gian mượn và hình thức nhận xe (Giao tận nơi hoặc tự lấy tại bãi).", icon: <Smartphone size={48} className="text-blue-600"/>, color: "bg-blue-100", borderColor: "border-blue-200" },
  { num: "02", title: "Thanh toán giữ chỗ", desc: "Áp dụng mã ưu đãi và thanh toán cọc 30% (hoặc thanh toán toàn bộ) để xác nhận giữ xe.", icon: <CreditCard size={48} className="text-indigo-600"/>, color: "bg-indigo-100", borderColor: "border-indigo-200" },
  { num: "03", title: "Ký HĐ & Nhận xe", desc: "Đến bãi hoặc nhận xe tại nhà. Kiểm tra tình trạng xe, ký hợp đồng điện tử và nhận chìa khóa.", icon: <Key size={48} className="text-teal-600"/>, color: "bg-teal-100", borderColor: "border-teal-200" },
  { num: "04", title: "Trả xe & Đánh giá", desc: "Hoàn trả xe đúng hạn, thanh toán phần còn lại (nếu có) và đánh giá chuyến đi để tích điểm.", icon: <Star size={48} className="text-orange-600"/>, color: "bg-orange-100", borderColor: "border-orange-200" },
];

// ==========================================
// DATA ƯU ĐIỂM NỔI BẬT
// ==========================================
const FEATURES = [
  { title: "Lái xe an toàn", desc: "Chuyến đi được bảo vệ với Gói bảo hiểm thuê xe tự lái. Bồi thường tối đa khi có sự cố ngoài ý muốn.", icon: <ShieldCheck size={36} className="text-green-600"/>, color: "bg-green-100" },
  { title: "An tâm đặt xe", desc: "Hoàn 100% tiền giữ chỗ nếu xe bị huỷ chuyến trong vòng 7 ngày trước ngày khởi hành.", icon: <CalendarCheck size={36} className="text-blue-600"/>, color: "bg-blue-100" },
  { title: "Thủ tục đơn giản", desc: "Chỉ cần CCCD gắn chip và Giấy phép lái xe là bạn đã đủ điều kiện thuê xe trên AutoHub.", icon: <FileText size={36} className="text-purple-600"/>, color: "bg-purple-100" },
  { title: "Thanh toán dễ dàng", desc: "Đa dạng hình thức: Tiền mặt, Thẻ Visa/Mastercard, Ví MoMo, ZaloPay, VNPay.", icon: <CreditCard size={36} className="text-orange-600"/>, color: "bg-orange-100" },
  { title: "Giao xe tận nơi", desc: "Lựa chọn giao xe tận nhà, khách sạn hoặc sân bay... Tiết kiệm tối đa thời gian di chuyển.", icon: <MapPin size={36} className="text-red-600"/>, color: "bg-red-100" },
  { title: "Dòng xe đa dạng", desc: "Hàng trăm dòng xe cho bạn tùy ý lựa chọn: Mini, Sedan, CUV, SUV, MPV, Bán tải.", icon: <CarFront size={36} className="text-teal-600"/>, color: "bg-teal-100" },
];

export default async function Home() {
  let cars = [];
  let locationStats = []; 
  let brandStats = [];

  try {
    cars = await prisma.car.findMany({
      where: { status: "APPROVED" },
      take: 8,
      orderBy: { id: 'desc' }, 
      //  ĐÃ SỬA CÚ PHÁP: Bọc thêm chữ "select" để Prisma không báo lỗi
      include: {
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: {
            bookings: {
              where: { status: { in: ["COMPLETED", "RETURNED"] } } 
            }
          }
        }
      }
    });

    locationStats = await prisma.car.groupBy({
      by: ['location'],
      where: { status: "APPROVED" },
      _count: { location: true }
    });

    brandStats = await prisma.car.groupBy({
      by: ['brand'],
      where: { status: "APPROVED" },
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } } 
    });

  } catch (error) {
    console.error("Lỗi kết nối Database:", error);
  }

  return (
    <main className="relative min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">
      
      {/*  BACKGROUND CỐ ĐỊNH CHỨA HÌNH ẢNH ĐỘNG 2 BÊN SƯỜN */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <style>{`
          @keyframes floatCar { 0%, 100% { transform: translateY(0) rotate(-15deg); } 50% { transform: translateY(-40px) rotate(-12deg); } }
          @keyframes spinCompass { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-float-car { animation: floatCar 8s ease-in-out infinite; }
          .animate-spin-compass { animation: spinCompass 40s linear infinite; }
        `}</style>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.4]"></div>
        <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[35%] right-[-15%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-multiply"></div>
        <div className="hidden xl:block absolute top-[15%] left-[-8%] opacity-[0.03] text-blue-900 animate-float-car"><CarFront size={600} strokeWidth={0.5} /></div>
        <div className="hidden xl:block absolute top-[40%] right-[-10%] opacity-[0.03] text-indigo-900 animate-spin-compass"><Compass size={700} strokeWidth={0.5} /></div>
      </div>

      <div className="relative z-[50]"> 
         <HeroBanner />
         <div className="-mt-24 relative z-[60] px-4 max-w-7xl mx-auto"> 
            <SearchWidget />
         </div>
      </div>

      <div className="container mx-auto px-4 mt-24 space-y-32 relative z-[10] max-w-7xl">
        
        {/* PHẦN 1: XE NỔI BẬT */}
        <div id="car-section" className="scroll-mt-24 relative">
           <div className="relative z-10">
             <CarSection title="Xe Nổi Bật" subTitle="Khám phá những mẫu xe đời mới nhất đang sẵn sàng phục vụ bạn" cars={cars} showFilters={false} />
             <div className="flex justify-center mt-16 relative z-20">
               <Link href="/cars" className="group relative flex items-center gap-3 bg-white text-blue-900 px-10 py-5 rounded-full font-black uppercase italic tracking-tighter hover:text-white transition-all duration-500 overflow-hidden shadow-2xl shadow-blue-900/10 hover:shadow-blue-600/30 active:scale-95 border border-white hover:border-transparent">
                 <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out -z-10"></span>
                 <Sparkles size={20} className="text-blue-500 group-hover:text-blue-200 transition-colors" />
                 <span className="relative z-10 text-lg">Xem toàn bộ xe rảnh</span>
                 <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform relative z-10" />
               </Link>
             </div>
           </div>
        </div>

        {/* PHẦN 2: HƯỚNG DẪN THUÊ XE */}
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">Hướng dẫn thuê xe</h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Quy trình 4 bước minh bạch và an toàn tuyệt đối giúp bạn nhanh chóng bắt đầu chuyến hành trình.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {RENT_STEPS.map((step, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-8 rounded-[40px] text-center border-2 border-transparent hover:border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className={`w-32 h-32 mx-auto rounded-full ${step.color} border-4 ${step.borderColor} flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-blue-900 shadow-md">{step.num}</div>
                  {step.icon}
                </div>
                <h3 className="text-xl font-black text-blue-900 uppercase italic tracking-tighter mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PHẦN 3 & 4: HÃNG VÀ ĐỊA ĐIỂM */}
        <div id="brand-section" className="scroll-mt-32 relative"><div className="relative z-10"><BrandList brands={brandStats} /></div></div>
        <div id="location-section" className="scroll-mt-32 relative"><div className="relative z-10"><LocationList stats={locationStats} /></div></div>

        {/* PHẦN 5: ƯU ĐIỂM NỔI BẬT */}
        <div className="relative z-10 bg-white rounded-[50px] p-10 lg:p-16 shadow-xl border border-gray-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 z-0"></div>
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">Ưu điểm nổi bật</h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Những tính năng và dịch vụ giúp bạn hoàn toàn an tâm và dễ dàng hơn khi thuê xe trên AutoHub AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {FEATURES.map((feature, index) => (
              <div key={index} className="flex gap-6 p-6 rounded-[32px] hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors group">
                <div className={`w-20 h-20 shrink-0 ${feature.color} rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform`}>{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-black text-gray-800 uppercase italic tracking-tighter mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/*   ĐĂNG KÝ HỢP TÁC CHỦ XE (PARTNER CTA) */}
        {/* ========================================================= */}
        <div className="relative bg-blue-900 rounded-[50px] p-10 lg:p-16 overflow-hidden shadow-2xl z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-800 rounded-full blur-[100px] opacity-50 -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[100px] opacity-30 -ml-20 -mb-20"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            
            {/* Cột trái: Lời kêu gọi & Nút bấm */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/50 text-blue-200 font-black text-[10px] uppercase tracking-widest mb-6 border border-blue-700 backdrop-blur-sm">
                <Briefcase size={14} /> Dành cho đối tác
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 text-white leading-tight">
                Gia tăng thu nhập <br/><span className="text-blue-400">cùng AutoHub AI</span>
              </h2>
              <p className="text-blue-100 text-lg mb-10 leading-relaxed font-medium">
                Biến chiếc xe nhàn rỗi của bạn thành nguồn thu nhập thụ động bền vững. Quản lý linh hoạt, an toàn tuyệt đối với hệ thống hợp đồng điện tử và đối soát thông minh.
              </p>

              <div className="flex flex-wrap gap-4">
                 <Link href="/partner" className="bg-white text-blue-900 px-8 py-4 rounded-full font-black uppercase italic tracking-tighter hover:bg-blue-50 transition-all active:scale-95 shadow-xl flex items-center gap-2">
                   Đăng ký hồ sơ ngay <ArrowRight size={18} />
                 </Link>
                 
                 <a href="#partner-steps" className="bg-blue-800/50 backdrop-blur-md text-white border border-blue-400 px-8 py-4 rounded-full font-black uppercase italic tracking-tighter hover:bg-blue-700 transition-all active:scale-95">
                   Cách thức hợp tác
                 </a>
              </div>
            </div>

            {/* Cột phải: Quy trình 3 bước hợp tác */}
            <div className="lg:w-1/2 w-full" id="partner-steps">
              <div className="space-y-4">
                 <div className="flex gap-5 items-center bg-blue-800/40 p-6 rounded-3xl border border-blue-700/50 backdrop-blur-sm hover:bg-blue-800/60 transition-colors group">
                    <div className="w-16 h-16 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner text-white group-hover:scale-110 transition-transform">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1 text-white">1. Cung cấp hồ sơ xe</h4>
                      <p className="text-blue-200 text-sm font-medium">Tạo tài khoản đối tác, điền thông tin xe và tải lên hình ảnh, giấy đăng kiểm trực tuyến.</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-5 items-center bg-blue-800/40 p-6 rounded-3xl border border-blue-700/50 backdrop-blur-sm hover:bg-blue-800/60 transition-colors group">
                    <div className="w-16 h-16 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner text-white group-hover:scale-110 transition-transform">
                      <BadgeCheck size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1 text-white">2. Kiểm duyệt nhanh chóng</h4>
                      <p className="text-blue-200 text-sm font-medium">Quản trị viên hệ thống sẽ phân tích, đối chiếu và phê duyệt hồ sơ xe của bạn nhanh chóng.</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-5 items-center bg-blue-800/40 p-6 rounded-3xl border border-blue-700/50 backdrop-blur-sm hover:bg-blue-800/60 transition-colors group">
                    <div className="w-16 h-16 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner text-white group-hover:scale-110 transition-transform">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1 text-white">3. Nhận chuyến & Sinh lời</h4>
                      <p className="text-blue-200 text-sm font-medium">Giao xe cho khách và nhận doanh thu chuyển thẳng vào ví đối tác sau mỗi chuyến đi.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN 6 & 7: REVIEW VÀ FAQ */}
        <div className="pt-10 relative"><div className="relative z-10"><HomeReviews /></div></div>
        <div className="pb-10 relative"><div className="relative z-10"><FaqSection /></div></div>
        
      </div>
    </main>
  );
}
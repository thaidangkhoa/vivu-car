/* eslint-disable */
// @ts-nocheck
"use client"; // Đổi thành Client Component để dùng được sự kiện onError của ảnh

import { useEffect, useState } from "react";
import { ShieldCheck, Car, HelpCircle, PhoneCall, ArrowRight, FileText, Newspaper, Calendar, Compass, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";

//  HÀM 1: LẤY TIN TỨC TỪ VNEXPRESS (ĐÃ VÁ LỖI HOTLINKING)
async function getCarNews() {
  try {
    const rssUrl = 'https://vnexpress.net/rss/oto-xe-may.rss';
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await res.json();

    if (data.status === 'ok' && data.items) {
      return data.items.slice(0, 3).map((item, index) => {
        // Cố gắng bóc tách ảnh từ nội dung HTML
        const imgMatch = item.description.match(/src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800"; 
        const cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();

        return {
          id: index + 1,
          title: item.title, 
          desc: cleanDesc.length > 120 ? cleanDesc.substring(0, 120) + "..." : cleanDesc, 
          image: imageUrl, 
          date: new Date(item.pubDate).toLocaleDateString('vi-VN'), 
          source: "VnExpress",
          url: item.link 
        };
      });
    }
    return []; 
  } catch (error) {
    console.error("Lỗi lấy tin tức:", error);
    return [];
  }
}

//  HÀM 2: MỞ RỘNG TOÀN BỘ 12 ĐỊA ĐIỂM DU LỊCH
function getTravelGuides() {
  return [
    { value: "HaNoi", name: "Hà Nội", desc: "Thủ đô nghìn năm văn hiến, góc phố cổ kính hòa quyện cùng nhịp sống hiện đại.", img: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&q=80&w=400" },
    { value: "TPHCM", name: "Hồ Chí Minh", desc: "Thành phố không ngủ với nhịp sống sôi động và những công trình kiến trúc độc đáo.", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=400" },
    { value: "DaNang", name: "Đà Nẵng", desc: "Thành phố đáng sống nhất Việt Nam với những cây cầu biểu tượng và bãi biển tuyệt đẹp.", img: "https://tse1.mm.bing.net/th/id/OIP.n5fK4T2uUlwaSnrgalc0VgHaEa?pid=Api&h=220&P=0" },
    { value: "NhaTrang", name: "Nha Trang", desc: "Vịnh biển lộng lẫy, thiên đường của những khu nghỉ dưỡng và trò chơi trên biển sôi động.", img: "https://tse3.mm.bing.net/th/id/OIP.Px1X0sb11NT1QtTXJu88pgHaE8?pid=Api&h=220&P=0" },
    { value: "PhuQuoc", name: "Phú Quốc", desc: "Thiên đường đảo ngọc vẫy gọi với những bãi cát trắng mịn và hải sản tươi sống.", img: "https://tse1.mm.bing.net/th/id/OIP.yukIsevD2C6LUuO-cmNyZQHaEK?pid=Api&h=220&P=0" },
    { value: "DaLat", name: "Đà Lạt", desc: "Trốn cái nóng ồn ào, tận hưởng không khí se lạnh và ngàn hoa khoe sắc tại xứ sương mù.", img: "https://tse1.mm.bing.net/th/id/OIP.5zDQ4NXe8MNybDiPy7i0tgHaEF?pid=Api&h=220&P=0" },
    { value: "HaLong", name: "Hạ Long", desc: "Kỳ quan thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi kỳ vĩ vươn lên từ mặt nước.", img: "https://tse1.mm.bing.net/th/id/OIP.RgYQk8GdgfPFtpo7geQaXwHaEs?pid=Api&h=220&P=0" },
    { value: "VungTau", name: "Vũng Tàu", desc: "Địa điểm đổi gió cuối tuần hoàn hảo chỉ cách TP.HCM vài giờ lái xe thư giãn.", img: "https://tse2.mm.bing.net/th/id/OIP.KhLAmur6GEnSxSm-KXTWuwHaDF?pid=Api&h=220&P=0" },
    { value: "CanTho", name: "Cần Thơ", desc: "Gạo trắng nước trong, khám phá văn hóa chợ nổi miệt vườn sông nước miền Tây.", img: "https://tse4.mm.bing.net/th/id/OIP.DfJTFJM7PINKQ7mPKlNDSwHaEW?pid=Api&h=220&P=0" },
    { value: "HoiAn", name: "Hội An", desc: "Phố cổ lung linh lồng đèn, nơi thời gian ngưng đọng trên những mái ngói rêu phong.", img: "https://tse2.mm.bing.net/th/id/OIP.KNPIC3tvqATw21GSA0TYcAHaFH?pid=Api&h=220&P=0" },
    { value: "Hue", name: "Huế", desc: "Cố đô trầm mặc, mang đậm dấu ấn lịch sử với các lăng tẩm và nền ẩm thực cung đình.", img: "https://tse3.mm.bing.net/th/id/OIP.SxSOiojAfquSc6IxngPYQwHaEK?pid=Api&h=220&P=0" },
    { value: "QuyNhon", name: "Quy Nhơn", desc: "Thành phố biển yên bình với những Eo Gió, Kỳ Co hoang sơ đầy nắng và gió.", img: "https://tse3.mm.bing.net/th/id/OIP.leS44AYPbc5zpOLwu_2WcAHaFj?pid=Api&h=220&P=0" }
  ];
}

export default function AboutPage() {
  const [newsArticles, setNewsArticles] = useState([]);
  const travelGuides = getTravelGuides(); // Gọi trực tiếp 12 địa điểm

  useEffect(() => {
    getCarNews().then(data => setNewsArticles(data));
  }, []);

  const values = [
    { icon: <Car size={32}/>, title: "Đa dạng phương tiện", desc: "Hệ thống kết nối hàng trăm chủ xe đối tác. Mọi phương tiện đều được kiểm định chất lượng.", actionText: "Khám phá đội xe", actionLink: "/cars" },
    { icon: <FileText size={32}/>, title: "Minh bạch tuyệt đối", desc: "Bảo vệ quyền lợi tối đa với Hợp đồng điện tử tự động. Hoàn toàn không có phụ phí ẩn.", actionText: "Quy chế hoạt động", actionLink: "/policies/terms" },
    { icon: <HelpCircle size={32}/>, title: "Giải đáp tường tận", desc: "Từ thủ tục đặt cọc, giao nhận xe đến xử lý sự cố. Mọi thắc mắc đều được giải đáp chi tiết.", actionText: "Câu hỏi thường gặp", actionLink: "/#faq-section" },
    { icon: <PhoneCall size={32}/>, title: "Hỗ trợ khách hàng 24/7", desc: "Đội ngũ tổng đài viên và cứu hộ của chúng tôi luôn sẵn sàng đồng hành cùng bạn mọi lúc.", actionText: "Hotline: 1900 9999", actionLink: "tel:19009999" },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-28 pb-20 font-sans relative overflow-hidden">
      
      {/*  1. HIỆU ỨNG BACKGROUND HAI BÊN SƯỜN */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
        {/* Đốm sáng hai bên */}
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* PHẦN GIỚI THIỆU CHÍNH */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24 relative">
          
          {/* Cột trái (Text) */}
          <div className="lg:w-1/2 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 border border-blue-100">
              <ShieldCheck size={14} /> Nền tảng di chuyển thông minh
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-blue-900 uppercase italic tracking-tighter mb-6 leading-none">
              Câu chuyện về <br/> <span className="text-blue-600">Nền tảng</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 italic font-medium">
              Không chỉ là một ứng dụng cho thuê xe đơn thuần. Chúng tôi là cầu nối công nghệ, mang đến trải nghiệm thuê xe tự lái minh bạch, nhanh chóng và an toàn nhất cho người Việt.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-lg hover:-translate-y-1 transition-all">
                <p className="text-4xl font-black text-blue-600 italic leading-none mb-2 flex items-center gap-2">
                  <Users size={28} className="text-blue-300"/> 200+
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đối tác chủ xe</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-lg hover:-translate-y-1 transition-all">
                <p className="text-4xl font-black text-blue-600 italic leading-none mb-2 flex items-center gap-2">
                  <Car size={28} className="text-blue-300"/> 10k+
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chuyến thành công</p>
              </div>
            </div>
          </div>

          {/* Cột phải (Hình ảnh & Thẻ nổi) */}
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-[40px] rotate-3 -z-10 blur-xl"></div>
            
            <img 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" 
              className="rounded-[40px] shadow-2xl w-full h-[500px] object-cover relative z-10 border-4 border-white"
              alt="Câu chuyện nền tảng"
            />

            {/*  2. THẺ NỔI (FLOATING BADGES) TRANG TRÍ MẶT BÊN CẠNH */}
            <div className="absolute top-10 -left-10 bg-white p-4 rounded-3xl shadow-2xl z-20 animate-bounce hover:scale-105 transition-transform" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Bảo hiểm</p>
                  <p className="text-sm font-black text-blue-900 italic">100% Chuyến đi</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-10 bg-white p-4 rounded-3xl shadow-2xl z-20 animate-bounce hover:scale-105 transition-transform" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Đánh giá</p>
                  <p className="text-sm font-black text-blue-900 italic">4.9/5 Tuyệt vời</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* GIÁ TRỊ CỐT LÕI */}
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-2">Cam kết của chúng tôi</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Hệ sinh thái dịch vụ toàn diện</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 relative z-10">
          {values.map((item, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm p-10 rounded-[40px] border border-white shadow-lg hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-300 group flex flex-col">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-blue-900 uppercase italic mb-4 tracking-tighter">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium mb-8 flex-1">{item.desc}</p>
              <Link href={item.actionLink} className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors w-fit group/btn mt-auto">
                {item.actionText}
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/*  3. MỞ RỘNG TOÀN BỘ 12 ĐỊA ĐIỂM DU LỊCH */}
        <div className="mb-32 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                <Compass className="text-blue-600" size={32} /> Cảm hứng xê dịch
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Khám phá mạng lưới 12 tỉnh thành</p>
            </div>
          </div>

          {/* Lưới Grid 4 cột (Responsive) chứa đủ 12 địa điểm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {travelGuides.map((guide, idx) => (
              <div key={idx} className="group relative rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-[260px]">
                <img src={guide.img} alt={guide.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent"></div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-black uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin size={12} /> Việt Nam
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 group-hover:text-blue-300 transition-colors">{guide.name}</h3>
                  <p className="text-gray-300 text-xs font-medium leading-relaxed line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {guide.desc}
                  </p>
                  
                  <Link 
                    href={`/cars?location=${guide.value}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl w-fit transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Tìm xe <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  4. GÓC TIN TỨC (ĐÃ FIX LỖI ẢNH) */}
        {newsArticles.length > 0 && (
          <div className="mb-32 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                  <Newspaper className="text-blue-600" size={32} /> Điểm tin Ô tô
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Tin tức xe cộ & thị trường mới nhất</p>
              </div>
              <a href="https://vnexpress.net/oto-xe-may" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                Xem tất cả bài viết <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <div key={article.id} className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full relative">
                  <div className="h-48 overflow-hidden relative bg-gray-100">
                    {/* 🛡️ FIX HOTLINKING: referrerPolicy="no-referrer" và onError */}
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-900 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                      {article.source}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                      <Calendar size={12} /> {article.date}
                    </div>
                    <h3 className="text-lg font-black text-gray-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-6 flex-1">
                      {article.desc}
                    </p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 mt-auto hover:text-blue-800 relative z-20">
                      Đọc tiếp <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10 opacity-0 cursor-pointer" aria-label="Đọc tiếp bài viết"></a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LỜI KÊU GỌI (CTA) */}
        <div className="bg-blue-900 rounded-[50px] p-12 text-center text-white relative overflow-hidden shadow-2xl z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-800 rounded-full -ml-20 -mb-20 opacity-50"></div>
          
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4 relative z-10">
            Sẵn sàng khởi hành cùng chúng tôi?
          </h2>
          <p className="text-blue-200 font-medium mb-8 max-w-2xl mx-auto relative z-10">
            Trải nghiệm nền tảng đặt xe tự lái thế hệ mới. Hàng ngàn chiếc xe đang chờ bạn khám phá.
          </p>
          <Link href="/cars" className="inline-block bg-white text-blue-900 px-10 py-5 rounded-[20px] font-black uppercase italic tracking-tighter hover:bg-blue-600 hover:text-white transition-all shadow-xl relative z-10 active:scale-95">
            Tìm xe rảnh ngay
          </Link>
        </div>

      </div>
    </main>
  );
}
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";

//  Đã đưa thẳng danh sách 12 tỉnh thành vào đây, thay thế Base64 bằng link ảnh thật
// (Đã xóa cột carCount tĩnh vì bên dưới bạn đã dùng realCount từ Database)
const LOCATIONS_UI = [
  { id: 1, name: "Hà Nội", value: "HaNoi", image: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "TP. Hồ Chí Minh", value: "TPHCM", image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Đà Nẵng", value: "DaNang", image: "https://tse1.mm.bing.net/th/id/OIP.n5fK4T2uUlwaSnrgalc0VgHaEa?pid=Api&h=220&P=0" },
  { id: 4, name: "Nha Trang", value: "NhaTrang", image: "https://tse3.mm.bing.net/th/id/OIP.Px1X0sb11NT1QtTXJu88pgHaE8?pid=Api&h=220&P=0" },
  { id: 5, name: "Phú Quốc", value: "PhuQuoc", image: "https://tse1.mm.bing.net/th/id/OIP.yukIsevD2C6LUuO-cmNyZQHaEK?pid=Api&h=220&P=0" },
  { id: 6, name: "Đà Lạt", value: "DaLat", image: "https://tse1.mm.bing.net/th/id/OIP.5zDQ4NXe8MNybDiPy7i0tgHaEF?pid=Api&h=220&P=0" },
  { id: 7, name: "Hạ Long", value: "HaLong", image: "https://tse1.mm.bing.net/th/id/OIP.RgYQk8GdgfPFtpo7geQaXwHaEs?pid=Api&h=220&P=0" },
  { id: 8, name: "Vũng Tàu", value: "VungTau", image: "https://tse2.mm.bing.net/th/id/OIP.KhLAmur6GEnSxSm-KXTWuwHaDF?pid=Api&h=220&P=0" },
  { id: 9, name: "Cần Thơ", value: "CanTho", image: "https://tse4.mm.bing.net/th/id/OIP.DfJTFJM7PINKQ7mPKlNDSwHaEW?pid=Api&h=220&P=0" },
  { id: 10, name: "Hội An", value: "HoiAn", image: "https://tse2.mm.bing.net/th/id/OIP.KNPIC3tvqATw21GSA0TYcAHaFH?pid=Api&h=220&P=0" },
  { id: 11, name: "Huế", value: "Hue", image: "https://tse3.mm.bing.net/th/id/OIP.SxSOiojAfquSc6IxngPYQwHaEK?pid=Api&h=220&P=0" },
  { id: 12, name: "Quy Nhơn", value: "QuyNhon", image: "https://tse3.mm.bing.net/th/id/OIP.leS44AYPbc5zpOLwu_2WcAHaFj?pid=Api&h=220&P=0" },
];

// 1. Định nghĩa interface chặt chẽ để tránh lỗi TypeScript
interface LocationStatItem {
  location: string;
  _count: {
    location: number;
  };
}

interface LocationListProps {
  // Thêm dấu ? để phòng trường hợp stats bị null/undefined
  stats?: LocationStatItem[];
}

export default function LocationList({ stats = [] }: LocationListProps) {
  return (
    <section className="mt-24">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
          <Navigation size={20} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">Địa điểm nổi bật</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest italic">Dữ liệu xe thực tế theo khu vực</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {LOCATIONS_UI.map((loc) => {
          // VÁ LỖI 1: Thêm optional chaining (?.) và kiểm tra an toàn
          // Ép kiểu toString() để đảm bảo so sánh chuỗi chính xác
          const dbStat = stats?.find(s => s.location?.toString() === loc.value?.toString());
          const realCount = dbStat ? dbStat._count.location : 0;

          return (
            <Link 
              key={loc.id} 
              // VÁ LỖI 2: Đảm bảo href luôn là string hợp lệ
              href={{
                pathname: '/cars',
                query: { location: loc.value },
              }}
              className="relative h-72 rounded-[32px] overflow-hidden cursor-pointer group shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Ảnh nền */}
              <img 
                src={loc.image} 
                alt={loc.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Lớp phủ Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent"></div>
              
              {/* Nội dung Text */}
              <div className="absolute bottom-5 left-5 text-white z-10">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={10} className="text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                    {realCount} chiếc xe sẵn sàng
                  </p>
                </div>
                <h3 className="font-black text-xl uppercase italic tracking-tighter leading-none">{loc.name}</h3>
              </div>

              {/* Hiệu ứng viền */}
              <div className="absolute inset-3 border-2 border-white/0 group-hover:border-white/10 rounded-[24px] transition-all duration-500"></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
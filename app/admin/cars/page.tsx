/* eslint-disable */
// @ts-nocheck
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, CarFront, CheckCircle2, Clock, 
  CalendarDays, CalendarClock, Building2, Handshake,
  EyeOff, XCircle //  THÊM ICON NÀY
} from "lucide-react";
import ActionButtons from "./ActionButtons"; 

export const dynamic = "force-dynamic";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

export default async function AdminCarsManagerPage({ searchParams }: any) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams?.tab || "system"; 

  const allCars = await prisma.car.findMany({
    include: {
      bookings: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { id: "desc" }
  });

  const now = new Date();

  const systemCars = allCars.filter((car) => car.ownerType === "COMPANY"); 
  const partnerCars = allCars.filter((car) => car.ownerType === "PARTNER");

  const renderCarTable = (carList: any[], emptyMessage: string) => {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table suppressHydrationWarning className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="p-5">ID</th>
                <th className="p-5">Thông tin xe</th>
                <th className="p-5">Phân loại</th>
                <th className="p-5">Giá/Ngày</th>
                <th className="p-5">Trạng thái</th>
                <th className="p-5">Lịch trình gần nhất</th>
                <th className="p-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {carList.map((car: any) => {
                const currentBooking = car.bookings.find(
                  (b: any) => new Date(b.startDate) <= now && new Date(b.endDate) >= now
                );
                const nextBooking = !currentBooking ? car.bookings.find(
                  (b: any) => new Date(b.startDate) > now
                ) : null;
                const isBusy = !!currentBooking;

                return (
                  //  LÀM MỜ XE BỊ ẨN ĐỂ ADMIN DỄ NHÌN
                  <tr key={car.id} className={`hover:bg-blue-50/30 transition-colors group ${car.status === 'HIDDEN' ? 'opacity-70 grayscale-[20%]' : ''}`}>
                    <td className="p-5 font-bold text-gray-400 text-sm">#{car.id}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-100 shrink-0">
                          <img src={car.image} alt={car.name} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="font-black text-blue-900 uppercase tracking-tighter text-base flex items-center gap-2">
                            {car.name} 
                            {car.status === 'HIDDEN' && <span className="text-[9px] text-white bg-gray-500 px-1.5 py-0.5 rounded uppercase tracking-widest not-italic">Đã ẩn</span>}
                          </p>
                          <p className="text-xs font-medium text-gray-500 truncate max-w-[150px]" title={car.address || car.location}>
                            {car.address ? car.address.split(',')[0] : car.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest block w-fit">
                        {car.brand} - {car.transmission === "Automatic" ? "TĐ" : "Sàn"}
                      </span>
                    </td>
                    <td className="p-5 font-black text-green-600 italic">
                      {new Intl.NumberFormat('vi-VN').format(car.priceDiscount)}đ
                    </td>
                    
                    {/*  ĐÃ SỬA CỘT TRẠNG THÁI HIỂN THỊ CHUẨN XÁC HƠN */}
                    <td className="p-5">
                      {car.status === 'HIDDEN' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                          <EyeOff size={14} /> Tạm ẩn
                        </div>
                      ) : car.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold border border-yellow-100">
                          <Clock size={14} /> Chờ duyệt
                        </div>
                      ) : car.status === 'REJECTED' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                          <XCircle size={14} /> Từ chối
                        </div>
                      ) : isBusy ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                          <Clock size={14} /> Đang cho thuê
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100">
                          <CheckCircle2 size={14} /> Sẵn sàng
                        </div>
                      )}
                    </td>

                    <td className="p-5">
                      {currentBooking ? (
                        <div className="text-xs font-medium text-orange-700 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100/50">
                          <p className="flex items-center gap-1.5 mb-1"><Clock size={12} className="text-orange-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Đang chạy</span></p>
                          <p>Nhận: <span className="font-bold">{formatDate(currentBooking.startDate)}</span></p>
                          <p>Trả: <span className="font-bold text-red-600">{formatDate(currentBooking.endDate)}</span></p>
                        </div>
                      ) : nextBooking ? (
                        <div className="text-xs font-medium text-blue-700 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                          <p className="flex items-center gap-1.5 mb-1"><CalendarClock size={12} className="text-blue-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sắp giao</span></p>
                          <p>Nhận: <span className="font-bold">{formatDate(nextBooking.startDate)}</span></p>
                          <p>Trả: <span className="font-bold text-red-600">{formatDate(nextBooking.endDate)}</span></p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                          <CalendarDays size={14} /> <span className="text-[10px] uppercase tracking-widest">Trống lịch</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {/*  TRUYỀN THÊM BIẾN VÀO ACTION BUTTONS */}
                      <ActionButtons carId={car.id} currentStatus={car.status} carName={car.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {carList.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-bold italic">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto"> 
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter flex items-center gap-3">
              <CarFront className="text-blue-600 w-8 h-8" /> Quản lý Đội xe
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Tổng cộng <strong className="text-blue-600">{allCars.length}</strong> chiếc xe trong hệ thống 
            </p>
          </div>
          <Link href="/admin/cars/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-200 flex items-center gap-2 shrink-0">
            <Plus size={18} /> Thêm xe mới
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-8 bg-gray-200/50 p-1.5 rounded-2xl w-fit border border-gray-200/50">
          <Link
            href="?tab=system"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 ${
              activeTab === "system"
                ? "bg-white text-indigo-700 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            <Building2 size={16} /> Xe hệ thống ({systemCars.length})
          </Link>
          
          <Link
            href="?tab=partner"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 ${
              activeTab === "partner"
                ? "bg-white text-orange-600 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-orange-500"
            }`}
          >
            <Handshake size={16} /> Xe đối tác ({partnerCars.length})
          </Link>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "system" ? (
            renderCarTable(systemCars, "Hệ thống chưa có xe riêng nào. Hãy thêm xe mới nhé!")
          ) : (
            renderCarTable(partnerCars, "Chưa có đối tác nào ký gửi xe trên hệ thống.")
          )}
        </div>

      </div>
    </div>
  );
}
/* eslint-disable */
// @ts-nocheck
"use client";

import Link from "next/link";
import { CarFront, CalendarDays, Plus, Edit, Trash2, Banknote, CheckCircle2, Clock, XCircle, EyeOff, Eye, Handshake } from "lucide-react";

export default function MyFleet({ myCars, handleDeleteCar, handleToggleCarStatus }) { //  Nhận thêm prop mới
  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-gray-50 pb-6">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase italic">Đội xe của tôi</h2>
          <p className="text-xs font-bold text-gray-400 mt-1">Cập nhật trạng thái xe</p>
        </div>
        <Link href="/partner" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all text-xs">
          <Plus size={16} /> Đăng ký thêm xe
        </Link>
      </div>

      <div className="space-y-6">
        {myCars.length === 0 ? (
          <div className="text-center py-10">
            <CarFront className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Bạn chưa đăng ký phương tiện nào.</p>
          </div>
        ) : (
          myCars.map((car) => (
            <div key={car.id} className={`flex flex-col lg:flex-row bg-gray-50/50 border border-gray-100 rounded-[24px] p-5 gap-6 items-start lg:items-center transition-all hover:bg-white hover:border-blue-100 hover:shadow-md ${car.status === 'HIDDEN' ? 'opacity-80 grayscale-[20%]' : ''}`}>
              <div className="flex items-center gap-5 flex-1 w-full">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  car.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                  car.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 
                  car.status === 'REJECTED' ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-500' //  HIDDEN
                }`}>
                  {car.status === 'HIDDEN' ? <EyeOff size={28} /> : <CarFront size={28} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-blue-900 text-lg uppercase italic tracking-tighter">
                    {car.name} {car.status === 'HIDDEN' && <span className="text-xs text-gray-500 font-bold bg-gray-200 px-2 py-1 rounded ml-2 not-italic">Đã ẩn</span>}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white border border-gray-200 px-2 py-1 rounded-md">
                      Biển số: {car.licensePlate || 'Chưa cập nhật'}
                    </span>
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                      <Banknote size={14}/> {car.priceOriginal?.toLocaleString('vi-VN')}đ / ngày
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
                
                {/* HIỂN THỊ TRẠNG THÁI HIỆN TẠI */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {car.status === 'APPROVED' && (
                    <>
                      <div className="flex justify-center items-center gap-2 text-green-600 font-black text-[10px] uppercase bg-green-50 px-3 py-2 rounded-lg w-full sm:w-auto italic">
                        <CheckCircle2 size={14} /> Đang hoạt động
                      </div>
                      <Link href="/partner/calendar" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl transition-all italic">
                        <CalendarDays size={14} /> Quản lý lịch
                      </Link>
                      <Link 
  href={`/partner/contract/${car.id}`} 
  target="_blank"
  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors w-full"
>
  <Handshake size={12} /> Hợp đồng
</Link>
                    </>
                  )}
                  {car.status === 'PENDING' && (
                    <div className="flex justify-center items-center gap-2 text-yellow-600 font-black text-[10px] uppercase bg-yellow-50 px-3 py-2 rounded-lg w-full sm:w-auto italic">
                      <Clock size={14} /> Chờ kiểm duyệt
                    </div>
                  )}
                  {car.status === 'REJECTED' && (
                    <div className="w-full">
                      <div className="flex justify-center items-center gap-2 text-red-500 font-black text-[10px] uppercase bg-red-50 px-3 py-2 rounded-lg w-full sm:w-auto mb-2 italic">
                        <XCircle size={14} /> Bị từ chối
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 text-center sm:text-left">Lý do: <span className="text-red-500 italic">{car.rules || "Liên hệ hỗ trợ"}</span></p>
                    </div>
                  )}
                  {car.status === 'HIDDEN' && (
                    <div className="flex justify-center items-center gap-2 text-gray-500 font-black text-[10px] uppercase bg-gray-100 px-3 py-2 rounded-lg w-full sm:w-auto italic">
                      <EyeOff size={14} /> Tạm dừng cho thuê
                    </div>
                  )}
                </div>

                {/* KHU VỰC NÚT THAO TÁC (Sửa / Ẩn / Mở / Xóa) */}
                {/*  NÚT XEM HỢP ĐỒNG ĐIỆN TỬ */}

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-3">
                  <Link href={`/partner/cars/${car.id}/edit`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest">
                    <Edit size={14} /> Sửa
                  </Link>

                  {/*  NÚT BẤM ẨN / MỞ */}
                  {car.status === 'APPROVED' && (
                    <button onClick={() => handleToggleCarStatus(car.id, car.status, car.name)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-500 hover:bg-gray-500 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest">
                      <EyeOff size={14} /> Tạm Ẩn
                    </button>
                  )}
                  {car.status === 'HIDDEN' && (
                    <button onClick={() => handleToggleCarStatus(car.id, car.status, car.name)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest">
                      <Eye size={14} /> Mở Lại
                    </button>
                  )}

                  <button onClick={() => handleDeleteCar(car.id, car.name)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest">
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
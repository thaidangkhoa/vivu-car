/* eslint-disable */
// @ts-nocheck
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff, Loader2, FileText } from "lucide-react";

//  BỔ SUNG: Nhận thêm currentStatus và carName từ bảng truyền xuống
export default function ActionButtons({ 
  carId, 
  currentStatus = "", 
  carName = "N/A" 
}: { 
  carId: number, 
  currentStatus?: string, 
  carName?: string 
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    //  BỔ SUNG: Nâng cấp cảnh báo chống xóa nhầm
    const confirmDelete = window.confirm(`CẢNH BÁO TỪ HỆ THỐNG:\n\nBạn đang chuẩn bị XÓA VĨNH VIỄN chiếc xe "${carName}" (ID: #${carId}).\nHành động này sẽ làm hỏng các báo cáo doanh thu cũ có liên quan đến xe này.\n\n👉 Khuyên dùng: Hãy sử dụng nút "Tạm Ẩn" (Hình con mắt gạch chéo) để an toàn dữ liệu.\n\nBạn vẫn kiên quyết muốn XÓA CỨNG?`);
    if (!confirmDelete) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/cars/${carId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        alert("Đã xóa xe thành công!");
        router.refresh(); // Tự động F5 lại bảng dữ liệu
      } else {
        alert(data.error || "Có lỗi xảy ra khi xóa.");
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ.");
    } finally {
      setIsProcessing(false);
    }
  };

  //  TÍNH NĂNG MỚI: HÀM ẨN / MỞ XE (SOFT DELETE)
  const handleToggleStatus = async () => {
    const newStatus = currentStatus === 'HIDDEN' ? 'APPROVED' : 'HIDDEN';
    const actionText = newStatus === 'HIDDEN' ? 'TẠM ẨN' : 'MỞ LẠI HOẠT ĐỘNG';
    
    if (!window.confirm(`Xác nhận: ${actionText} xe "${carName}"?`)) return;

    setIsProcessing(true);
    try {
      // Gọi chung vào API quản lý trạng thái
      const res = await fetch(`/api/partner/cars/${carId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        router.refresh(); // Cập nhật lại UI ngay lập tức
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-end gap-2 items-center">
      {/* NÚT XEM HỒ SƠ */}
      <Link href={`/admin/cars/${carId}`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Xem hồ sơ xe">
        <FileText size={18} />
      </Link>

      {/* NÚT SỬA */}
      <Link href={`/admin/cars/${carId}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
        <Edit size={18} />
      </Link>

      {/*  NÚT ẨN / MỞ (Chỉ hiện khi xe đang ở trạng thái Hoạt động hoặc Đã ẩn) */}
      {(currentStatus === 'APPROVED' || currentStatus === 'HIDDEN') && (
        <button 
          onClick={handleToggleStatus}
          disabled={isProcessing}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            currentStatus === 'HIDDEN' 
              ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={currentStatus === 'HIDDEN' ? "Mở lại xe" : "Tạm ẩn xe"}
        >
          {/* Nếu đang xử lý API thì xoay xoay, ngược lại thì hiện icon */}
          {isProcessing ? <Loader2 size={18} className="animate-spin text-gray-400"/> : currentStatus === 'HIDDEN' ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
      
      {/* NÚT XÓA */}
      <button onClick={handleDelete} disabled={isProcessing} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Xóa xe">
        <Trash2 size={18} />
      </button>
    </div>
  );
}
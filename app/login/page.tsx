/* eslint-disable */
// @ts-nocheck
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/features/AuthModal"; // Gọi Modal đã có sẵn của Khoa

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Xác định đích đến sau khi thành công: Ưu tiên callback hoặc về trang chủ
  const callback = searchParams.get("callback") || "/";

  // 2. Kiểm tra nếu đã có User trong máy thì không cho ở lại trang Login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.replace("/");
    }
  }, [router]);

  const handleClose = () => {
    // Nếu khách bấm dấu X, đưa họ về trang chủ để tránh kẹt ở trang đen
    router.push("/");
  };

  const handleLoginSuccess = () => {
    /** *  GIẢI PHÁP CHO LỖI KẸT TRANG LOGIN:
     * Sử dụng window.location.href để ép trình duyệt tải lại toàn bộ trang web.
     * Việc này giúp Navbar nhận diện User mới trong localStorage ngay lập tức.
     */
    window.location.href = callback;
  };

  return (
    /** * GIAO DIỆN NỀN MỜ: Tối ưu theo phong cách BonbonCar */
    <div className="min-h-screen w-full bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <AuthModal 
          isOpen={true} 
          onClose={handleClose} 
          onSuccess={handleLoginSuccess} // Truyền logic xử lý thành công
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    /** * Suspense: Bắt buộc để tránh lỗi Hydration khi dùng useSearchParams trong Next.js */
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white font-black italic uppercase tracking-tighter animate-pulse">
            Đang kết nối ViVuCar...
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ĐÃ SỬA: Lấy 'token' từ trên thanh URL xuống thay vì 'id'
  const token = searchParams.get("token"); 

  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự!");
    if (password !== confirmPass) return setError("Mật khẩu xác nhận không khớp!");
    
    // ĐÃ SỬA: Kiểm tra sự tồn tại của token
    if (!token) return setError("Đường dẫn không hợp lệ hoặc đã hết hạn. Vui lòng xin lại link mới!");

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ĐÃ SỬA: Gửi đúng `token` qua body thay vì `userId`
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("🎉 Chúc mừng! Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        router.push("/"); // Đẩy khách về trang chủ để đăng nhập
      } else {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  // ĐÃ SỬA: Chặn không cho render form nếu không có token trên URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-black text-red-500">❌ Đường dẫn không hợp lệ hoặc đã hết hạn!</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-blue-900 italic uppercase tracking-tighter leading-none">
                MẬT KHẨU MỚI
            </h2>
            <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus-within:border-blue-500 transition-all">
              <Lock className="text-gray-400 mr-3" size={20}/>
              <input 
                type="password" placeholder="Mật khẩu mới (ít nhất 6 ký tự)" 
                className="bg-transparent outline-none w-full font-bold text-gray-700" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
              />
          </div>

          <div className="flex items-center border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus-within:border-blue-500 transition-all">
              <Lock className="text-gray-400 mr-3" size={20}/>
              <input 
                type="password" placeholder="Xác nhận mật khẩu mới" 
                className="bg-transparent outline-none w-full font-bold text-gray-700" 
                value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} 
              />
          </div>

          {error && <p className="text-red-500 text-xs font-bold italic text-center">* {error}</p>}

          <button onClick={handleSubmit} disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all flex justify-center shadow-xl shadow-blue-100 active:scale-95 disabled:bg-gray-400 uppercase italic tracking-tighter">
              {isLoading ? <Loader2 className="animate-spin"/> : "CẬP NHẬT MẬT KHẨU"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Bọc trong Suspense để tránh lỗi của Next.js khi dùng useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
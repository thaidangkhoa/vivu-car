/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Lock, Save, Loader2, ShieldCheck } from "lucide-react";

export default function EditProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [activeTab, setActiveTab] = useState("info"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Trạng thái cho thông tin cá nhân
  const [infoData, setInfoData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  // Trạng thái cho đổi mật khẩu
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!isOpen) return null;

  //  CẬP NHẬT THÔNG TIN VÀO DATABASE
  const handleSaveInfo = async () => {
    if (!infoData.name || !infoData.phone || !infoData.email) 
      return alert("Vui lòng điền đầy đủ thông tin!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...infoData
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Cập nhật LocalStorage và giao diện Profile
        localStorage.setItem("user", JSON.stringify(result));
        onUpdate(result);
        alert("BonbonCar đã cập nhật hồ sơ của bạn thành công!");
        onClose();
      } else {
        alert(result.error || "Lỗi lưu dữ liệu");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔐 ĐỔI MẬT KHẨU BẢO MẬT
  const handleChangePassword = async () => {
    if (!passData.currentPassword || !passData.newPassword) 
      return alert("Vui lòng nhập mật khẩu!");
    if (passData.newPassword !== passData.confirmPassword) 
      return alert("Mật khẩu xác nhận không chính xác!");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Đổi mật khẩu thành công! Bạn cần đăng nhập lại.");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Ép đăng nhập lại để đảm bảo bảo mật
      } else {
        alert(result.error || "Mật khẩu hiện tại không đúng");
      }
    } catch (error) {
      alert("Lỗi hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 p-2 transition-colors">
          <X size={24} />
        </button>

        {/* CHUYỂN ĐỔI TAB */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === "info" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
          >
            Thông tin hồ sơ
          </button>
          <button 
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === "password" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
          >
            Bảo mật
          </button>
        </div>

        {activeTab === "info" ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                <User size={18} className="text-blue-600 mr-3" />
                <input 
                  type="text" 
                  className="bg-transparent outline-none w-full font-bold text-blue-900"
                  value={infoData.name}
                  onChange={(e) => setInfoData({...infoData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email liên hệ</label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                <Mail size={18} className="text-blue-600 mr-3" />
                <input 
                  type="email" 
                  className="bg-transparent outline-none w-full font-bold text-blue-900"
                  value={infoData.email}
                  onChange={(e) => setInfoData({...infoData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                <Phone size={18} className="text-blue-600 mr-3" />
                <input 
                  type="tel" 
                  className="bg-transparent outline-none w-full font-bold text-blue-900"
                  value={infoData.phone}
                  onChange={(e) => setInfoData({...infoData, phone: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleSaveInfo}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase italic tracking-tighter disabled:bg-gray-400"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Lưu thay đổi</>}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                <ShieldCheck size={18} className="text-gray-400 mr-3" />
                <input 
                  type="password" 
                  className="bg-transparent outline-none w-full font-bold text-blue-900"
                  placeholder="••••••••"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                <Lock size={18} className="text-blue-600 mr-3" />
                <input 
                  type="password" 
                  className="bg-transparent outline-none w-full font-bold text-blue-900"
                  placeholder="Nhập mật khẩu mới"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus-within:border-blue-500 transition-all">
                <Lock size={18} className="text-blue-600 mr-3" />
                <input 
                  type="password" 
                  className="bg-transparent outline-none w-full font-bold text-blue-900"
                  placeholder="Xác nhận lại mật khẩu"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-blue-100 uppercase italic tracking-tighter disabled:bg-gray-400"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Xác nhận đổi mật khẩu"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Banknote, Wallet, Phone, Building2, Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle, X } from "lucide-react";

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(Math.abs(amount)) + "đ";
};

export default function WithdrawalApprovals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  //  STATE MỚI: Quản lý Modal từ chối
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    txId: null,
    reason: "",
    isSubmitting: false
  });

  useEffect(() => { fetchWithdrawals(); }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/withdrawals");
      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch(e) { console.error("Lỗi tải dữ liệu rút tiền:", e); }
    finally { setLoading(false); }
  };

  //  CẬP NHẬT: Hàm xử lý nhận thêm tham số reason (description)
  const handleAction = async (id, newStatus, reason = "") => {
    if (newStatus === 'COMPLETED') {
      if (!confirm(`XÁC NHẬN: Bạn ĐÃ CHUYỂN KHOẢN và DUYỆT yêu cầu rút tiền này?`)) return;
    }
    
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, description: reason }), // Gửi kèm reason
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Thao tác thành công!");
        fetchWithdrawals();
        if (newStatus === 'FAILED') setRejectModal({ isOpen: false, txId: null, reason: "", isSubmitting: false });
      } else {
        alert(`❌ LỖI: ${data.error}`);
        if (newStatus === 'FAILED') setRejectModal(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (error) { 
      alert("Đã xảy ra lỗi kết nối!"); 
      if (newStatus === 'FAILED') setRejectModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const submitReject = () => {
    if (!rejectModal.reason.trim()) {
      return alert("Vui lòng nhập lý do từ chối để thông báo cho đối tác!");
    }
    setRejectModal(prev => ({ ...prev, isSubmitting: true }));
    handleAction(rejectModal.txId, 'FAILED', rejectModal.reason);
  };

  const filtered = filter === "ALL" ? withdrawals : withdrawals.filter(w => w.status === filter);

  if (loading) return <div className="py-20 text-center text-emerald-600 font-black animate-pulse uppercase italic">Đang tải lệnh rút tiền...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-bold text-sm px-4">Kế toán trả tiền Đối tác</p>
        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full md:w-auto overflow-x-auto">
          {["PENDING", "COMPLETED", "FAILED", "ALL"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all whitespace-nowrap ${filter === s ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-gray-400 hover:bg-white hover:shadow-sm"}`}>
              {s === "ALL" ? "Tất cả" : s === "PENDING" ? "Chờ xử lý" : s === "COMPLETED" ? "Đã duyệt" : "Đã hủy"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6 border-b border-gray-100">Đối tác</th>
                <th className="p-6 border-b border-gray-100">Số tiền & Ngân hàng</th>
                <th className="p-6 border-b border-gray-100">Thời gian</th>
                <th className="p-6 border-b border-gray-100 text-center">Trạng thái & Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-16 text-center text-gray-400 font-bold italic">Chưa có yêu cầu rút tiền nào trong mục này.</td></tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><Wallet size={20}/></div>
                        <div>
                          <p className="font-black text-emerald-900 uppercase text-xs italic tracking-tighter">{tx.wallet?.ownerName || tx.wallet?.user?.name || "Đối tác ẩn danh"}</p>
                          <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5"><Phone size={10}/> {tx.wallet?.ownerPhone || tx.wallet?.user?.phone || "Chưa cập nhật"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-red-600 text-lg italic tracking-tighter">{formatCurrency(tx.amount)}</p>
                      <div className="mt-2 bg-gray-50 border border-gray-100 p-3 rounded-xl w-fit">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Building2 size={12}/> {tx.wallet?.bankName || "Chưa cập nhật NH"}</p>
                        <p className="text-sm font-black text-gray-800 tracking-wider mb-0.5">{tx.wallet?.bankAccount || "Chưa có STK"}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{tx.wallet?.bankOwnerName || "Chưa có tên chủ thẻ"}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-gray-600">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">{new Date(tx.createdAt).toLocaleTimeString('vi-VN')}</p>
                    </td>
                    <td className="p-6 text-center">
                      {tx.status === 'PENDING' ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase italic bg-yellow-50 text-yellow-600 flex items-center gap-1"><Clock size={12}/> Chờ xử lý</span>
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleAction(tx.id, 'COMPLETED')} className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 shadow-lg transition-all active:scale-95" title="Duyệt - Đã chuyển tiền"><CheckCircle size={18} /></button>
                            
                            {/*  CẬP NHẬT: Bấm nút này sẽ mở Modal thay vì chạy hàm ngay */}
                            <button onClick={() => setRejectModal({ isOpen: true, txId: tx.id, reason: "", isSubmitting: false })} className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95" title="Từ chối - Hoàn tiền"><XCircle size={18} /></button>
                          </div>
                        </div>
                      ) : tx.status === 'COMPLETED' ? (
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase italic bg-emerald-50 text-emerald-600 inline-flex items-center gap-1 border border-emerald-100"><CheckCircle size={12}/> Đã hoàn thành</span>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase italic bg-red-50 text-red-600 inline-flex items-center gap-1 border border-red-100"><AlertCircle size={12}/> Bị từ chối</span>
                          
                          {/*  MỚI: Hiện lý do từ chối nếu có */}
                          {tx.description && (
                            <div className="mt-1 bg-red-50 border border-red-100 text-red-600 text-[9px] p-2 rounded-lg font-bold italic max-w-[200px] break-words text-left w-full">
                              Lý do: {tx.description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/*  MODAL HỎI LÝ DO TỪ CHỐI */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" onClick={() => !rejectModal.isSubmitting && setRejectModal({ isOpen: false, txId: null, reason: "", isSubmitting: false })}></div>
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter mb-2">Từ chối rút tiền</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">Bạn đang yêu cầu hủy lệnh rút tiền mã số <span className="font-bold text-blue-600">#{rejectModal.txId}</span>. Tiền sẽ được cộng lại vào Ví Đối Tác.</p>
            
            <div className="mb-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Lý do từ chối (Bắt buộc) <span className="text-red-500">*</span></label>
              <textarea 
                value={rejectModal.reason} 
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))} 
                placeholder="VD: Sai thông tin tài khoản ngân hàng, Tên chủ thẻ không khớp với CCCD..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-red-300 focus:bg-white transition-all resize-none h-28"
              ></textarea>
            </div>
            
            <div className="flex gap-3">
              <button disabled={rejectModal.isSubmitting} onClick={() => setRejectModal({ isOpen: false, txId: null, reason: "", isSubmitting: false })} className="flex-1 py-4 bg-gray-50 text-gray-500 font-black uppercase italic text-[10px] rounded-2xl border border-gray-200 hover:bg-gray-100">Hủy bỏ</button>
              <button disabled={rejectModal.isSubmitting} onClick={submitReject} className="flex-[2] py-4 bg-red-500 text-white font-black uppercase italic text-[11px] rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                {rejectModal.isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, ArrowDownToLine, ArrowUpRight, Landmark, 
  History, Clock, CheckCircle2, AlertCircle, CarFront, Loader2
} from "lucide-react";

export default function PartnerWalletPage() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  //  STATE LƯU THÔNG TIN NGÂN HÀNG
  const [bankInfo, setBankInfo] = useState({ bankName: "", bankAccount: "", bankOwnerName: "" });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);

  // LẤY DỮ LIỆU TỪ DATABASE
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch('/api/partner/wallet');
        const data = await res.json();
        if (data.success) {
          setBalance(data.wallet.balance);
          setTransactions(data.wallet.transactions);
          
          // Nạp dữ liệu ngân hàng nếu đã có
          setBankInfo({
            bankName: data.wallet.bankName || "",
            bankAccount: data.wallet.bankAccount || "",
            bankOwnerName: data.wallet.bankOwnerName || ""
          });
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu ví:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, []);

  // HÀM XỬ LÝ LƯU THÔNG TIN NGÂN HÀNG
  const handleSaveBankInfo = async (e) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      const res = await fetch('/api/partner/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankInfo)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingBank(false);
        alert("Cập nhật thông tin ngân hàng thành công!");
      } else {
        alert("Lỗi cập nhật: " + data.error);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsSavingBank(false);
    }
  };

  // HÀM XỬ LÝ YÊU CẦU RÚT TIỀN (GỌI API)
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount.replace(/[^0-9]/g, ''));

    if (!amount || amount < 500000) return alert("Số tiền rút tối thiểu là 500,000đ");
    if (amount > balance) return alert("Số dư không đủ để thực hiện giao dịch này!");

    setIsSubmitLoading(true);
    try {
      const res = await fetch('/api/partner/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();

      if (data.success) {
        setBalance(data.wallet.balance);
        setTransactions([data.transaction, ...transactions]); // Cập nhật UI ngay
        setIsWithdrawing(false);
        setWithdrawAmount("");
        alert("Yêu cầu rút tiền thành công! Admin sẽ kiểm tra và chuyển tiến về tài khoản trong 24h.");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center font-black text-blue-600 animate-pulse"><Loader2 className="animate-spin mr-2"/> ĐANG TẢI DỮ LIỆU VÍ...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Khu vực đối tác</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3">
            <Wallet size={36} className="text-blue-600" /> Ví điện tử
          </h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-3">Quản lý doanh thu, lịch sử dòng tiền và yêu cầu rút tiền về tài khoản ngân hàng.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
          {/* CỘT TRÁI: THẺ NGÂN HÀNG & SỐ DƯ */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-8 rounded-[32px] shadow-xl shadow-blue-200/50 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -ml-5 -mb-5"></div>
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Số dư khả dụng</span>
                          <Wallet size={24} className="text-blue-300" />
                      </div>
                      <h2 className="text-4xl font-black mb-2">{balance.toLocaleString('vi-VN')}đ</h2>
                  </div>
              </div>

              {/* KHU VỰC RÚT TIỀN HOẶC NHẬP NGÂN HÀNG */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  {isWithdrawing ? (
                      <form onSubmit={handleWithdraw} className="space-y-4 animate-in fade-in zoom-in duration-300">
                          <h3 className="text-sm font-black text-gray-800 uppercase italic border-b border-gray-50 pb-2">Tạo lệnh rút tiền</h3>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền muốn rút (VNĐ)</label>
                              <input 
                                  type="text" autoFocus
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                  className="w-full bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm font-bold text-gray-700"
                                  placeholder="VD: 5000000"
                              />
                              <p className="text-[10px] text-gray-400 font-bold">Rút toàn bộ: <span className="text-blue-600 cursor-pointer" onClick={() => setWithdrawAmount(balance.toString())}>{balance.toLocaleString('vi-VN')}đ</span></p>
                          </div>
                          <div className="flex gap-2 pt-2">
                              <button type="button" onClick={() => setIsWithdrawing(false)} className="flex-1 bg-gray-100 text-gray-500 font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-gray-200 transition-all">Hủy</button>
                              <button type="submit" disabled={isSubmitLoading} className="flex-[2] bg-blue-600 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                                  {isSubmitLoading ? "Đang xử lý..." : "Xác nhận rút"}
                              </button>
                          </div>
                      </form>
                  ) : (
                      // KHU VỰC QUẢN LÝ THÔNG TIN NGÂN HÀNG
                      isEditingBank || !bankInfo.bankAccount ? (
                          <form onSubmit={handleSaveBankInfo} className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-in fade-in duration-300">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Cập nhật tài khoản nhận tiền</p>
                              <input required placeholder="Tên Ngân Hàng (VD: Vietcombank)" value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all" />
                              <input required placeholder="Số Tài Khoản" value={bankInfo.bankAccount} onChange={(e) => setBankInfo({...bankInfo, bankAccount: e.target.value})} className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all" />
                              <input required placeholder="Tên Chủ Tài Khoản (In hoa không dấu)" value={bankInfo.bankOwnerName} onChange={(e) => setBankInfo({...bankInfo, bankOwnerName: e.target.value.toUpperCase()})} className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all" />
                              
                              <div className="flex gap-2 pt-2">
                                  {bankInfo.bankAccount && <button type="button" onClick={() => setIsEditingBank(false)} className="flex-1 bg-gray-200 text-gray-600 text-xs font-black py-3 rounded-xl hover:bg-gray-300 transition-all">Hủy</button>}
                                  <button type="submit" disabled={isSavingBank} className="flex-1 bg-green-600 text-white text-xs font-black py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200">{isSavingBank ? "Đang lưu..." : "Lưu thẻ"}</button>
                              </div>
                          </form>
                      ) : (
                          <div className="space-y-4 animate-in fade-in duration-300">
                              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0"><Landmark size={20} /></div>
                                      <div>
                                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{bankInfo.bankName}</p>
                                          <p className="text-sm font-black text-gray-800 tracking-wider">{bankInfo.bankAccount}</p>
                                          <p className="text-[10px] font-bold text-gray-500 uppercase">{bankInfo.bankOwnerName}</p>
                                      </div>
                                  </div>
                                  <button onClick={() => setIsEditingBank(true)} className="text-[10px] text-blue-500 font-bold hover:underline py-1">Sửa</button>
                              </div>
                              <button onClick={() => setIsWithdrawing(true)} className="w-full flex items-center justify-center gap-2 bg-blue-900 text-white font-black uppercase italic tracking-widest py-4 rounded-2xl hover:bg-blue-800 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-blue-200">
                                  <ArrowUpRight size={18} /> Yêu cầu rút tiền
                              </button>
                          </div>
                      )
                  )}
              </div>
          </div>

          {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
          <div className="lg:col-span-2">
              <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[400px]">
                  <div className="flex items-center justify-between mb-6 border-b-2 border-gray-50 pb-4">
                      <h2 className="text-lg font-black text-gray-800 uppercase italic flex items-center gap-2"><History size={20} className="text-gray-400"/> Lịch sử giao dịch</h2>
                  </div>

                  <div className="space-y-4">
                      {transactions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 font-bold italic">Chưa có giao dịch nào.</div>
                      ) : transactions.map((tx) => (
                          <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-blue-100 rounded-2xl transition-all group">
                              <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'EARNING' ? 'bg-green-100 text-green-600' : tx.type === 'PAYOUT' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                      {tx.type === 'EARNING' ? <ArrowDownToLine size={20} /> : tx.type === 'PAYOUT' ? <ArrowUpRight size={20} /> : <AlertCircle size={20} />}
                                  </div>
                                  <div>
                                      <h4 className="font-black text-gray-800 text-sm">{tx.description}</h4>
                                      {tx.carPlate && (
                                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1 mt-1"><CarFront size={12}/> Biển số: {tx.carPlate}</span>
                                      )}
                                      <p className="text-xs font-bold text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                                  </div>
                              </div>

                              <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-gray-200 sm:border-none pt-3 sm:pt-0">
                                  <span className={`text-base font-black ${tx.type === 'EARNING' ? 'text-green-600' : 'text-gray-800'}`}>
                                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('vi-VN')}đ
                                  </span>
                                  {tx.status === 'COMPLETED' ? (
                                      <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 mt-1 bg-green-50 px-2 py-0.5 rounded"><CheckCircle2 size={12}/> Thành công</span>
                                  ) : tx.status === 'PENDING' ? (
                                      <span className="text-[10px] font-bold text-yellow-600 flex items-center gap-1 mt-1 bg-yellow-50 px-2 py-0.5 rounded"><Clock size={12}/> Đang xử lý</span>
                                  ) : (
                                      <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-1 bg-red-50 px-2 py-0.5 rounded"><AlertCircle size={12}/> Thất bại</span>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>
    </main>
  );
}
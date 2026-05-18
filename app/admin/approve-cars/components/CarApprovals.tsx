/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, User as UserIcon, Settings, Banknote, 
  Eye, ShieldAlert, Search, X, FileText, CheckCircle2, 
  Image as ImageIcon, AlertCircle, ShieldCheck, Map, Info,
  AlertTriangle, BadgeCheck
} from "lucide-react";

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(Math.abs(amount)) + "đ";
};

const getCarImages = (car) => {
  if (!car) return [];
  let allImages = [];
  if (car.image && typeof car.image === 'string') allImages.push(car.image);
  if (car.gallery) {
    if (Array.isArray(car.gallery)) {
      allImages = [...allImages, ...car.gallery];
    } else if (typeof car.gallery === 'string') {
      try {
        const parsed = JSON.parse(car.gallery);
        if (Array.isArray(parsed)) allImages = [...allImages, ...parsed];
      } catch (e) {
        if (car.gallery.includes(',')) {
          allImages = [...allImages, ...car.gallery.split(',').map(i => i.trim())];
        } else {
          allImages.push(car.gallery);
        }
      }
    }
  }
  return allImages.filter(Boolean);
};

const renderAmenities = (amenitiesData) => {
  if (!amenitiesData) return null;
  let list = [];
  if (Array.isArray(amenitiesData)) list = amenitiesData;
  else if (typeof amenitiesData === 'string') {
    try {
      list = JSON.parse(amenitiesData);
      if (!Array.isArray(list)) list = amenitiesData.split(',').map(s => s.trim());
    } catch (e) {
      list = amenitiesData.split(',').map(s => s.trim());
    }
  }
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {list.map((a, i) => (
        <span key={i} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-100">
          {a}
        </span>
      ))}
    </div>
  );
};

export default function CarApprovals() {
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [currentLegalDocIdx, setCurrentLegalDocIdx] = useState(0); 

  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => { fetchPendingCars(); }, []);

  const fetchPendingCars = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cars/pending');
      const data = await response.json();
      if (data.success || data.cars) {
        setPendingCars(data.cars || data);
      } else if (Array.isArray(data)) {
        setPendingCars(data);
      }
    } catch (e) { console.error("Lỗi tải dữ liệu xe:", e); }
    finally { setLoading(false); }
  };

  const handleApproveCar = async (carId, ownerName, isDepositPaid) => {
    // Nếu chưa đóng tiền, hỏi Admin có chắc chắn đã nhận tiền chưa
    const confirmMsg = isDepositPaid 
      ? `Xác nhận: Duyệt chiếc xe của ${ownerName || 'đối tác'} lên hệ thống?`
      : `Hệ thống ghi nhận xe này CHƯA ĐÓNG KÝ QUỸ.\nBạn xác nhận ĐÃ NHẬN ĐƯỢC 2.000.000đ từ đối tác ${ownerName} và muốn duyệt xe lên sàn?`;

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/cars/${carId}/approve`, { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        //  Gửi thêm lệnh update cờ ký quỹ
        body: JSON.stringify({ isDepositPaid: true }) 
      });
      const data = await res.json();
      if (res.ok) {
        setPendingCars(prev => prev.filter(c => c.id !== carId));
        setSelectedCar(null);
        alert(`✅ Đã duyệt thành công xe của ${ownerName || 'đối tác'}!`);
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch(e) { alert("Lỗi kết nối máy chủ!"); }
    finally { setIsProcessing(false); }
  };

  const handleRejectCar = async (carId, ownerName) => {
    if (!rejectReason.trim()) return alert("Vui lòng nhập lý do từ chối để đối tác biết đường chỉnh sửa!");
    if (!window.confirm(`Xác nhận: Từ chối hồ sơ xe của ${ownerName || 'đối tác'}?`)) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/cars/${carId}/reject`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setPendingCars(prev => prev.filter(c => c.id !== carId));
        setSelectedCar(null);
        setRejectReason("");
        alert(`❌ Đã từ chối hồ sơ. Lý do: ${rejectReason}`);
      }
    } catch(e) { alert("Lỗi kết nối máy chủ!"); }
    finally { setIsProcessing(false); }
  };

  const filteredCars = pendingCars.filter(car => {
    const searchString = searchTerm.toLowerCase();
    const ownerName = car.user?.name?.toLowerCase() || "";
    const carName = car.name?.toLowerCase() || "";
    const plate = car.licensePlate?.toLowerCase() || "";
    return ownerName.includes(searchString) || carName.includes(searchString) || plate.includes(searchString);
  });

  if (loading) return <div className="py-20 text-center text-blue-600 font-black animate-pulse uppercase">Đang tải hồ sơ xe...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-bold text-sm px-4">Đang có <span className="text-red-500 font-black text-lg">{pendingCars.length}</span> hồ sơ chờ duyệt</p>
        <div className="relative w-full md:w-80">
          <input 
            type="text" placeholder="Tìm tên chủ xe, xe, biển số..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-gray-700 bg-gray-50 shadow-sm"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[30px] border-2 border-dashed border-gray-200 shadow-sm">
          <ShieldAlert className="mx-auto text-green-400 mb-4" size={48} />
          <h3 className="text-xl font-black text-gray-800 uppercase italic">Tuyệt vời!</h3>
          <p className="text-gray-500 font-bold">Hiện không có hồ sơ xe nào chờ duyệt hoặc không tìm thấy kết quả.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCars.map((car) => {
            const carImages = getCarImages(car);
            return (
              <div key={car.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-blue-200 transition-all relative">
                
                {/*  TEM HIỂN THỊ TRẠNG THÁI KÝ QUỸ LÊN GÓC THẺ XE */}
                {car.isDepositPaid ? (
                   <div className="absolute top-4 left-4 z-10 bg-green-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-md italic flex items-center gap-1">
                     <BadgeCheck size={12}/> Đã đóng quỹ
                   </div>
                ) : (
                   <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-md italic flex items-center gap-1">
                     <AlertTriangle size={12}/> Chờ đóng quỹ
                   </div>
                )}

                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {carImages.length > 0 ? (
                    <img src={carImages[0]} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-md italic">Chờ duyệt</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4 mt-2">
                    <h3 className="text-lg font-black text-blue-900 uppercase italic tracking-tighter truncate">{car.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                      <MapPin size={12}/> {car.location || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 flex-1 border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><UserIcon size={14}/> Chủ xe:</span>
                      <span className="font-black text-gray-800 truncate max-w-[120px]">{car.user?.name || car.ownerName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Settings size={14}/> Biển số:</span>
                      <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{car.licensePlate || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Banknote size={14}/> Đề xuất:</span>
                      <span className="font-black text-emerald-600">{formatCurrency(car.priceOriginal)}/ngày</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCar(car); setCurrentImageIdx(0); setCurrentLegalDocIdx(0); setRejectReason(""); }} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic active:scale-95 shadow-sm">
                    <Eye size={16} /> Xem chi tiết & Xử lý
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCar && (() => {
        const images = getCarImages(selectedCar);
        const mainImageUrl = images[currentImageIdx] || null;

        const legalDocs = [
          { id: 'reg', label: "1. Đăng ký xe", url: selectedCar.registrationPaper },
          { id: 'insp', label: "2. Đăng kiểm", url: selectedCar.inspectionCertificate },
          { id: 'ins', label: "3. Bảo hiểm", url: selectedCar.insurancePaper }
        ];
        const availableLegalDocs = legalDocs.filter(doc => doc.url);
        const mainLegalDoc = availableLegalDocs[currentLegalDocIdx] || null;

        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedCar(null)}></div>
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3">
                    <FileText className="text-blue-600" /> Chi tiết hồ sơ phương tiện
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                    Mã hệ thống: #{selectedCar.id} 
                    {/*  HIỂN THỊ CỜ KÝ QUỸ & HỢP ĐỒNG */}
                    | Ký quỹ: 
                    {selectedCar.isDepositPaid ? (
                      <span className="text-green-500 font-black">Đã đóng</span>
                    ) : (
                      <span className="text-orange-500 font-black">Chưa đóng</span>
                    )}
                    | Hợp đồng: 
                    {selectedCar.contractAgreed ? (
                      <span className="text-green-500 font-black">Đã ký</span>
                    ) : (
                      <span className="text-gray-400">Trống</span>
                    )}
                  </p>
                </div>
                <button onClick={() => setSelectedCar(null)} className="p-2 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* CỘT 1: HÌNH ẢNH XE & MÔ TẢ */}
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4 ml-2 pr-2">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hình ảnh thực tế</h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{images.length} ảnh đính kèm</span>
                      </div>
                      <div 
                        className="aspect-video rounded-[24px] overflow-hidden bg-gray-100 border border-gray-100 cursor-pointer relative group"
                        onClick={() => mainImageUrl && setFullScreenImage(mainImageUrl)}
                      >
                        {mainImageUrl ? (
                          <>
                            <img src={mainImageUrl} alt="Car Main" className="w-full h-full object-cover transition-opacity duration-300" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white font-bold uppercase tracking-widest text-xs">Phóng to ảnh</div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <ImageIcon size={48} className="mb-2"/>
                            <span className="text-xs font-bold">Chưa tải ảnh lên</span>
                          </div>
                        )}
                      </div>
                      {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {images.map((img, idx) => (
                            <div key={idx} onClick={() => setCurrentImageIdx(idx)} className={`aspect-video rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-all ${currentImageIdx === idx ? 'border-blue-600 opacity-100 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src={img} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Chi tiết nội dung</h3>
                      
                      <div className="mb-4">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Mô tả từ chủ xe:</h4>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[80px] whitespace-pre-line">
                          {selectedCar.description || "Không có mô tả chi tiết."}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tiện nghi nổi bật:</h4>
                        {renderAmenities(selectedCar.amenities) || <span className="text-xs text-gray-400 italic">Không có tiện nghi đặc biệt</span>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1"><FileText size={12}/> Yêu cầu thuê</h4>
                          <p className="text-xs text-gray-700">{selectedCar.requirements || "Không có yêu cầu đặc biệt."}</p>
                        </div>
                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1"><Info size={12}/> Lưu ý & Phụ thu</h4>
                          <p className="text-xs text-gray-700">{selectedCar.rules || "Không có lưu ý."}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CỘT 2: THÔNG TIN CHỦ XE, KỸ THUẬT VÀ PHÁP LÝ */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><UserIcon size={14}/> Thông tin đối tác định danh</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500">Họ và tên:</span>
                          <span className="text-sm font-black text-blue-900 uppercase">{selectedCar.user?.name || selectedCar.ownerName || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500">SĐT:</span>
                          <span className="text-sm font-black text-gray-800">{selectedCar.user?.phone || selectedCar.ownerPhone || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500">CCCD/CMND:</span>
                          <span className="text-sm font-black text-gray-800">{selectedCar.ownerCCCD || "Đang cập nhật"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Settings size={14}/> Thông số phương tiện</h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div><span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dòng xe</span><span className="text-sm font-black text-gray-800">{selectedCar.name}</span></div>
                        <div><span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Hãng & Đời xe</span><span className="text-sm font-black text-gray-800">{selectedCar.brand} {selectedCar.carYear || selectedCar.year ? `- ${selectedCar.carYear || selectedCar.year}` : ''}</span></div>
                        <div><span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Biển kiểm soát</span><span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{selectedCar.licensePlate}</span></div>
                        <div><span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kiểu xe / Phân khúc</span><span className="text-sm font-black text-gray-800">{selectedCar.category || "N/A"} - {selectedCar.tier || "N/A"}</span></div>
                        <div><span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Hộp số / Nhiên liệu</span><span className="text-xs font-bold text-gray-600">{selectedCar.transmission || "N/A"} • {selectedCar.fuel || "N/A"}</span></div>
                        <div><span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Số chỗ ngồi</span><span className="text-xs font-bold text-gray-600 bg-orange-50 text-orange-600 px-2 py-1 rounded">{selectedCar.seats || "N/A"} Chỗ</span></div>
                        
                        <div className="col-span-2 border-t border-gray-50 pt-3 mt-1">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1"><MapPin size={10} className="inline mr-1"/>Địa chỉ bãi xe</span>
                          <span className="text-sm font-medium text-gray-800">{selectedCar.address || "N/A"}, {selectedCar.location || "N/A"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phí giao xe tận nhà</span>
                          <span className="text-sm font-bold text-gray-800">{selectedCar.deliveryFee ? formatCurrency(selectedCar.deliveryFee) : "Miễn phí"}</span>
                        </div>

                        <div className="col-span-2 mt-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><Banknote size={14}/> Mức giá đề xuất:</span>
                            <span className="text-xl font-black text-emerald-700 italic">{formatCurrency(selectedCar.priceOriginal)} / ngày</span>
                          </div>
                          {selectedCar.priceDiscount > 0 && selectedCar.priceDiscount !== selectedCar.priceOriginal && (
                            <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">Giá khuyến mãi:</span>
                              <span className="text-sm font-bold text-red-500">{formatCurrency(selectedCar.priceDiscount)} / ngày</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShieldCheck size={14}/> Hồ sơ pháp lý (Tuyệt mật)
                        </h3>
                        {mainLegalDoc && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md border border-red-200">{mainLegalDoc.label}</span>}
                      </div>

                      <div 
                        className="aspect-video rounded-[24px] overflow-hidden bg-white border border-red-200 cursor-pointer relative group shadow-sm mb-4"
                        onClick={() => mainLegalDoc && setFullScreenImage(mainLegalDoc.url)}
                      >
                        {mainLegalDoc ? (
                          <>
                            <img src={mainLegalDoc.url} alt={mainLegalDoc.label} className="w-full h-full object-cover transition-opacity duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white font-bold uppercase tracking-widest text-xs">Xem chi tiết ảnh lớn</div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <FileText size={48} className="mb-2"/>
                            <span className="text-xs font-bold">Chưa tải giấy tờ</span>
                          </div>
                        )}
                      </div>

                      {availableLegalDocs.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {availableLegalDocs.map((doc, idx) => (
                            <div key={doc.id} onClick={() => setCurrentLegalDocIdx(idx)} className="space-y-1.5 cursor-pointer">
                              <p className={`text-[9px] font-black uppercase tracking-widest text-center transition-colors ${currentLegalDocIdx === idx ? 'text-red-600' : 'text-gray-500'}`}>
                                {doc.label.split('.')[1]} 
                              </p>
                              <div className={`aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 transition-all ${currentLegalDocIdx === idx ? 'border-red-500 opacity-100 scale-95' : 'border-transparent opacity-60 hover:opacity-100 hover:border-red-300'}`}>
                                <img src={doc.url} className="w-full h-full object-cover" alt={doc.label} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-[9px] text-red-500 italic mt-4 font-medium text-center">* Bấm vào ảnh lớn phía trên để phóng to toàn màn hình.</p>
                    </div>

                    <div className="bg-red-50/50 p-5 rounded-[24px] border border-red-100">
                      <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertCircle size={14}/> Lý do nếu từ chối:</label>
                      <textarea placeholder="Ví dụ: Hình ảnh mờ..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-white border border-red-200 rounded-xl p-3 text-sm font-medium outline-none" rows={2}></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0 z-10">
                <button disabled={isProcessing} onClick={() => handleRejectCar(selectedCar.id, selectedCar.user?.name || selectedCar.ownerName)} className="px-6 py-3 bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic disabled:opacity-50">
                  {isProcessing ? "Đang xử lý..." : "Từ chối hồ sơ"}
                </button>
                
                {/*  NÚT DUYỆT THÔNG MINH */}
                {selectedCar.isDepositPaid ? (
                   <button disabled={isProcessing} onClick={() => handleApproveCar(selectedCar.id, selectedCar.user?.name || selectedCar.ownerName, true)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic disabled:opacity-50 active:scale-95">
                     <CheckCircle2 size={16} /> Phê duyệt lên sàn
                   </button>
                ) : (
                   <button disabled={isProcessing} onClick={() => handleApproveCar(selectedCar.id, selectedCar.user?.name || selectedCar.ownerName, false)} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic disabled:opacity-50 active:scale-95">
                     <Banknote size={16} /> Đã nhận 2.000.000đ & Duyệt
                   </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {fullScreenImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 sm:p-8" onClick={() => setFullScreenImage(null)}>
          <button className="absolute top-4 right-4 md:top-8 md:right-8 text-white bg-white/20 hover:bg-red-500 p-3 rounded-full transition-all shadow-lg z-50">
            <X size={28}/>
          </button>
          <img 
            src={fullScreenImage} 
            alt="Phóng to" 
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
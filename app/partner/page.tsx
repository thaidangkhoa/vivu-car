/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  CarFront, MapPin, ArrowRight, ArrowLeft, CheckCircle2, 
  Banknote, Loader2, ImagePlus, X, Settings, ShieldCheck, FileText, AlertCircle,
  UploadCloud 
} from "lucide-react";

// CONSTANTS
const BRANDS = ["Toyota", "VinFast", "Hyundai", "Ford", "Mitsubishi", "Kia", "Mazda", "Honda", "Suzuki", "MG", "Peugeot", "Mercedes", "BMW", "Audi", "Lexus", "Porsche", "LandRover", "Nissan", "Subaru", "Volvo", "Volkswagen", "Tesla", "BYD", "Khac"];
const CATEGORIES = [ { id: "Sedan", name: "Sedan" }, { id: "SUV", name: "SUV" }, { id: "Hatchback", name: "Hatchback" }, { id: "MPV", name: "MPV" }, { id: "Pickup", name: "Bán tải" }, { id: "Sport", name: "Xe thể thao" } ];
const TIERS = [ { id: "Budget", name: "Bình dân" }, { id: "Standard", name: "Phổ thông" }, { id: "Luxury", name: "Hạng sang" } ];
const LOCATIONS = [ { id: "HaNoi", name: "Hà Nội" }, { id: "TPHCM", name: "TP. Hồ Chí Minh" }, { id: "DaNang", name: "Đà Nẵng" }, { id: "NhaTrang", name: "Nha Trang" }, { id: "PhuQuoc", name: "Phú Quốc" }, { id: "DaLat", name: "Đà Lạt" }, { id: "HaLong", name: "Hạ Long" }, { id: "VungTau", name: "Vũng Tàu" }, { id: "CanTho", name: "Cần Thơ" }, { id: "HoiAn", name: "Hội An" }, { id: "Hue", name: "Huế" }, { id: "QuyNhon", name: "Quy Nhơn" } ];

export default function PartnerRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { router.push("/?auth=login&callback=/partner"); },
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  //  STATE ĐỂ LƯU LỖI TRÙNG BIỂN SỐ VÀ HỢP ĐỒNG KÝ QUỸ
  const [licensePlateError, setLicensePlateError] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: "", ownerPhone: "", ownerCCCD: "", licensePlate: "",
    carBrand: "Toyota", carModel: "", carYear: "", 
    category: "Sedan", tier: "Standard", seats: "5", 
    transmission: "Automatic", fuel: "Gasoline",
    location: "HaNoi", address: "", deliveryFee: "0", 
    description: "", 
    amenities: [], 
    requirements: "Bản gốc GPLX hạng B1 trở lên, CCCD gắn chíp (đối chiếu). Thế chấp 5 triệu đồng hoặc xe máy chính chủ.", 
    rules: "Giữ vệ sinh xe sạch sẽ, không hút thuốc. Trả xe đúng giờ (quá giờ phụ thu theo thỏa thuận).", 
    priceOriginal: "", priceDiscount: "", 
    images: [],
    registrationPaper: "", 
    inspectionCertificate: "", 
    insurancePaper: ""
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        ownerName: session.user.name || prev.ownerName,
        ownerPhone: session.user.phone || prev.ownerPhone,
      }));
    }
  }, [session]);

  const amenitiesList = ["Bản đồ", "Bluetooth", "Camera lùi", "Cảm biến lốp", "Cửa sổ trời", "Định vị GPS", "Khe cắm USB", "Lốp dự phòng","Camera 360"];

  const toggleAmenity = (name) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(name) 
        ? prev.amenities.filter(a => a !== name) 
        : [...prev.amenities, name]
    }));
  };

  const handleChange = (field, value) => {
    let cleanValue = value;

    if (['ownerCCCD', 'ownerPhone', 'carYear', 'deliveryFee', 'priceOriginal', 'priceDiscount'].includes(field)) {
      cleanValue = value.replace(/[^0-9]/g, ''); 
    }
    if (field === 'licensePlate') {
      cleanValue = value.toUpperCase(); 
    }

    setFormData(prev => ({ ...prev, [field]: cleanValue }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const checkLicensePlate = async (plate) => {
    if (!plate) return;
    try {
      const res = await fetch('/api/partner/cars/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate: plate })
      });
      const data = await res.json();
      
      if (data.exists) {
        setLicensePlateError("❌ Biển số xe này đã được đăng ký trên hệ thống!");
      } else {
        setLicensePlateError(""); 
      }
    } catch (error) {
      console.error("Lỗi kiểm tra biển số:", error);
    }
  };

  const handleNextStep = (targetStep) => {
    const currentErrors = {};

    if (targetStep === 2) {
      if (!formData.ownerName.trim()) currentErrors.ownerName = "Vui lòng nhập họ tên.";
      if (!formData.ownerPhone || !/^(0[3|5|7|8|9])[0-9]{8}$/.test(formData.ownerPhone)) currentErrors.ownerPhone = "SĐT phải gồm 10 số hợp lệ.";
      if (!formData.ownerCCCD || !/^\d{12}$/.test(formData.ownerCCCD)) currentErrors.ownerCCCD = "CCCD bắt buộc phải đủ 12 chữ số.";
      if (!formData.licensePlate || !/^[0-9]{2}[A-Z]{1,2}[-.]?[0-9]{4,5}$/i.test(formData.licensePlate)) currentErrors.licensePlate = "Biển số sai định dạng (VD: 51H-12345).";
    }

    if (targetStep === 3) {
      if (!formData.carModel.trim()) currentErrors.carModel = "Vui lòng nhập dòng xe.";
      if (!formData.carYear || formData.carYear.length !== 4 || parseInt(formData.carYear) < 2000 || parseInt(formData.carYear) > new Date().getFullYear()) {
        currentErrors.carYear = `Năm hợp lệ: 2000 - ${new Date().getFullYear()}`;
      }
      if (!formData.address.trim()) currentErrors.address = "Vui lòng nhập địa chỉ bãi xe.";
      if (formData.deliveryFee === "") currentErrors.deliveryFee = "Vui lòng nhập phí (nhập 0 nếu miễn phí).";
    }

    if (Object.keys(currentErrors).length > 0 || licensePlateError !== "") {
      setErrors(currentErrors);
      return; 
    }

    setStep(targetStep);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) return alert("Tối đa 5 ảnh");
    
    const base64Images = await Promise.all(files.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }));
    
    setFormData(prev => ({ ...prev, images: [...prev.images, ...base64Images] }));
  };

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleDocUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert("Vui lòng chọn ảnh có dung lượng dưới 5MB để đảm bảo tốc độ tải!");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (field) => {
    setFormData(prev => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.priceOriginal) return setErrors({ priceOriginal: "Vui lòng nhập giá thuê mong muốn." });
    if (formData.images.length === 0) return alert("Vui lòng tải lên ít nhất 1 ảnh xe!");
    
    if (!formData.registrationPaper) return alert("Vui lòng tải lên mặt trước Giấy đăng ký xe (Cà vẹt)!");
    if (!formData.inspectionCertificate) return alert("Vui lòng tải lên Giấy chứng nhận Đăng kiểm!");
    if (!formData.insurancePaper) return alert("Vui lòng tải lên Bảo hiểm xe! Đây là thủ tục bắt buộc.");
    
    setIsSubmitting(true);

    const dbPayload = {
      name: `${formData.carBrand} ${formData.carModel} ${formData.carYear}`,
      brand: formData.carBrand,
      category: formData.category,
      tier: formData.tier,
      transmission: formData.transmission,
      fuel: formData.fuel,
      seats: parseInt(formData.seats) || 5,
      location: formData.location,
      address: formData.address,
      deliveryFee: parseFloat(formData.deliveryFee) || 0,
      description: formData.description, 
      amenities: formData.amenities, 
      requirements: formData.requirements,
      rules: formData.rules,
      licensePlate: formData.licensePlate,
      ownerCCCD: formData.ownerCCCD,
      priceOriginal: parseFloat(formData.priceOriginal),
      priceDiscount: parseFloat(formData.priceDiscount) || parseFloat(formData.priceOriginal),
      
      image: formData.images[0] || "",
      gallery: formData.images.slice(1) || [],

      registrationPaper: formData.registrationPaper,
      inspectionCertificate: formData.inspectionCertificate,
      insurancePaper: formData.insurancePaper,
      
      // cờ xác nhận hợp đồng điện tử
      contractAgreed: isAgreed
    };

    try {
      const res = await fetch('/api/partner/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
      const data = await res.json();
      
      if (res.ok) {
        // Bật Modal Ký Quỹ 
        setShowDepositModal(true);
      } else {
        alert(data.error || "Lỗi lưu dữ liệu");
      }
    } catch (err) {
      alert("Lỗi kết nối Server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return (
      <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-widest text-xl">Đang tải biểu mẫu...</div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-28 font-sans relative">
      <div className="container mx-auto px-4 max-w-4xl bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-gray-100">
        
        {/* ================= BƯỚC 1 ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-blue-900 uppercase italic border-b border-gray-100 pb-4 flex items-center gap-2"><ShieldCheck/> Bước 1: Thông tin đối tác & Định danh</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Họ tên chủ xe <span className="text-red-500">*</span></label>
                <input type="text" value={formData.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} className={`w-full bg-white p-4 rounded-xl font-bold text-sm outline-none border ${errors.ownerName ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} />
                {errors.ownerName && <p className="text-red-500 text-[10px] font-bold italic flex items-center gap-1"><AlertCircle size={12}/> {errors.ownerName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại <span className="text-red-500">*</span></label>
                <input type="tel" maxLength="10" value={formData.ownerPhone} onChange={(e) => handleChange('ownerPhone', e.target.value)} className={`w-full bg-white p-4 rounded-xl font-bold text-sm outline-none border ${errors.ownerPhone ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} />
                {errors.ownerPhone && <p className="text-red-500 text-[10px] font-bold italic flex items-center gap-1"><AlertCircle size={12}/> {errors.ownerPhone}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Số CCCD / CMND <span className="text-red-500">*</span></label>
                <input type="text" maxLength="12" value={formData.ownerCCCD} onChange={(e) => handleChange('ownerCCCD', e.target.value)} className={`w-full bg-white p-4 rounded-xl font-bold text-sm outline-none border ${errors.ownerCCCD ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Nhập đủ 12 số" />
                {errors.ownerCCCD && <p className="text-red-500 text-[10px] font-bold italic flex items-center gap-1"><AlertCircle size={12}/> {errors.ownerCCCD}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Biển số xe <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.licensePlate} 
                  onChange={(e) => handleChange('licensePlate', e.target.value)} 
                  onBlur={(e) => checkLicensePlate(e.target.value)}
                  className={`w-full bg-white p-4 rounded-xl font-bold text-sm uppercase outline-none border ${(errors.licensePlate || licensePlateError) ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} 
                  placeholder="VD: 51H-12345" 
                />
                {errors.licensePlate && <p className="text-red-500 text-[10px] font-bold italic flex items-center gap-1"><AlertCircle size={12}/> {errors.licensePlate}</p>}
                {licensePlateError && <p className="text-red-500 text-[10px] font-bold italic flex items-center gap-1"><AlertCircle size={12}/> {licensePlateError}</p>}
              </div>
            </div>

            <button onClick={() => handleNextStep(2)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-all text-white font-black uppercase italic rounded-2xl shadow-lg shadow-blue-200">Tiếp tục bước 2 <ArrowRight className="inline ml-2" size={18}/></button>
          </div>
        )}

        {/* ================= BƯỚC 2 ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <button onClick={() => setStep(1)} className="p-2 bg-gray-100 rounded-xl text-gray-500 hover:text-blue-600"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-black text-blue-900 uppercase italic flex items-center gap-2"><Settings/> Bước 2: Thông số & Vị trí</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Hãng xe</label>
                <select value={formData.carBrand} onChange={(e) => handleChange('carBrand', e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                    {BRANDS.map(b => <option key={b} value={b}>{b === "LandRover" ? "Land Rover" : b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Dòng xe (Model) <span className="text-red-500">*</span></label>
                <input type="text" value={formData.carModel} onChange={(e) => handleChange('carModel', e.target.value)} className={`w-full bg-white border p-3 rounded-lg font-bold text-sm outline-none ${errors.carModel ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="VD: Vios" />
                {errors.carModel && <p className="text-red-500 text-[9px] font-bold mt-1 italic">{errors.carModel}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Năm SX <span className="text-red-500">*</span></label>
                <input type="text" maxLength="4" value={formData.carYear} onChange={(e) => handleChange('carYear', e.target.value)} className={`w-full bg-white border p-3 rounded-lg font-bold text-sm outline-none ${errors.carYear ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="VD: 2022" />
                {errors.carYear && <p className="text-red-500 text-[9px] font-bold mt-1 italic">{errors.carYear}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Số chỗ ngồi</label>
                <select value={formData.seats} onChange={(e) => handleChange('seats', e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                    <option value="4">4 chỗ</option>
                    <option value="5">5 chỗ</option>
                    <option value="7">7 chỗ</option>
                    <option value="8">8 chỗ</option>
                    <option value="9">9 chỗ</option>
                    <option value="16">16 chỗ</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Kiểu xe</label>
                <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Phân khúc</label>
                <select value={formData.tier} onChange={(e) => handleChange('tier', e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                    {TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Hộp số</label>
                <select value={formData.transmission} onChange={(e) => handleChange('transmission', e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                    <option value="Automatic">Tự động</option><option value="Manual">Số sàn</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Nhiên liệu</label>
                <select value={formData.fuel} onChange={(e) => handleChange('fuel', e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500">
                    <option value="Gasoline">Xăng</option><option value="Diesel">Dầu</option><option value="Electric">Điện</option><option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                <div className="space-y-2 col-span-full">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest"><MapPin size={14} className="inline mr-1"/> Địa chỉ bãi xe chính xác <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className={`w-full bg-white border p-4 rounded-xl font-bold text-sm outline-none ${errors.address ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Số nhà, Tên đường, Phường/Xã..." />
                    {errors.address && <p className="text-red-500 text-[10px] font-bold italic">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Thành phố</label>
                    <select value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500">
                        {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Phí giao xe (VNĐ) <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.deliveryFee} onChange={(e) => handleChange('deliveryFee', e.target.value)} className={`w-full bg-white border p-4 rounded-xl font-bold text-sm outline-none ${errors.deliveryFee ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Nhập 0 nếu miễn phí" />
                    {errors.deliveryFee && <p className="text-red-500 text-[10px] font-bold italic">{errors.deliveryFee}</p>}
                </div>
            </div>

            <button onClick={() => handleNextStep(3)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-all text-white font-black uppercase italic rounded-2xl shadow-lg shadow-blue-200">Tiếp tục bước 3 <ArrowRight className="inline ml-2" size={18}/></button>
          </div>
        )}

        {/* ================= BƯỚC 3 ================= */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <button type="button" onClick={() => setStep(2)} className="p-2 bg-gray-100 rounded-xl text-gray-500 hover:text-blue-600"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-black text-blue-900 uppercase italic flex items-center gap-2"><Banknote/> Bước 3: Giá, Chính sách & Ảnh</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-green-50/50 p-6 rounded-2xl border border-green-100">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Giá gốc (VNĐ/Ngày) <span className="text-red-500">*</span></label>
                <input type="text" value={formData.priceOriginal} onChange={(e) => handleChange('priceOriginal', e.target.value)} className={`w-full bg-white border p-4 rounded-xl font-black text-blue-600 text-lg outline-none ${errors.priceOriginal ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="800000" />
                {errors.priceOriginal && <p className="text-red-500 text-[10px] font-bold italic">{errors.priceOriginal}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Giá khuyến mãi (VNĐ/Ngày)</label>
                <input type="text" value={formData.priceDiscount} onChange={(e) => handleChange('priceDiscount', e.target.value)} className="w-full bg-white border border-gray-200 focus:border-blue-500 p-4 rounded-xl font-black text-green-600 text-lg outline-none" placeholder="Để trống nếu không giảm giá" />
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block"><FileText size={14} className="inline mr-1"/> Giới thiệu / Mô tả về xe</label>
                    <textarea rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full bg-white border border-gray-200 focus:border-blue-500 p-4 rounded-xl font-bold text-sm outline-none" placeholder="Giới thiệu về chiếc xe của bạn (VD: Xe gia đình đi giữ gìn, nội thất mới, tiết kiệm nhiên liệu...)" />
                </div>

                <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block"><FileText size={14} className="inline mr-1"/> Giấy tờ yêu cầu</label>
                    <textarea rows={2} value={formData.requirements} onChange={(e) => handleChange('requirements', e.target.value)} className="w-full bg-white border border-gray-200 focus:border-blue-500 p-4 rounded-xl font-bold text-sm outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block"><ShieldCheck size={14} className="inline mr-1"/> Lưu ý & Phụ thu</label>
                    <textarea rows={2} value={formData.rules} onChange={(e) => handleChange('rules', e.target.value)} className="w-full bg-white border border-gray-200 focus:border-blue-500 p-4 rounded-xl font-bold text-sm outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tiện nghi nổi bật</label>
                    <div className="flex flex-wrap gap-2">
                        {amenitiesList.map(item => (
                        <button type="button" key={item} onClick={() => toggleAmenity(item)} className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${formData.amenities.includes(item) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}>{item}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh hiển thị (Tối đa 5 ảnh) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.length < 5 && (
                        <label className="border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer h-24 relative transition-all">
                            <ImagePlus className="text-blue-500 mb-1" size={24} />
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    )}
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden h-24 group border border-gray-200">
                            <img src={img} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><X/></button>
                            {idx === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Ảnh chính</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/*  GIAO DIỆN UPLOAD GIẤY TỜ BẢO MẬT */}
            <div className="bg-red-50/50 p-6 rounded-[24px] border border-red-100 mb-8">
              <div className="mb-6">
                <h3 className="text-lg font-black text-red-700 uppercase italic flex items-center gap-2">
                  <ShieldCheck size={20} /> Hồ sơ pháp lý bắt buộc
                </h3>
                <p className="text-xs text-red-600/80 font-medium mt-1">
                  Cung cấp hình ảnh gốc, rõ nét. Dữ liệu này được bảo mật tuyệt đối, <strong className="font-black text-red-700">CHỈ</strong> Quản trị viên hệ thống mới có thể xem để đối soát.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    1. Mặt trước Cà vẹt <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 bg-white rounded-2xl p-4 flex flex-col items-center justify-center h-40 hover:bg-red-50 hover:border-red-400 transition-all group overflow-hidden shadow-inner">
                    {formData.registrationPaper ? (
                      <>
                        <img src={formData.registrationPaper} className="absolute inset-0 w-full h-full object-cover" />
                        <button type="button" onClick={() => removeDoc('registrationPaper')} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors z-10"><X size={14}/></button>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="text-gray-300 group-hover:text-red-500 mb-2 transition-colors" size={32} />
                        <span className="text-[10px] font-bold text-gray-400">Bấm tải ảnh lên</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" onChange={(e) => handleDocUpload(e, 'registrationPaper')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    2. Giấy Đăng kiểm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 bg-white rounded-2xl p-4 flex flex-col items-center justify-center h-40 hover:bg-red-50 hover:border-red-400 transition-all group overflow-hidden shadow-inner">
                    {formData.inspectionCertificate ? (
                      <>
                        <img src={formData.inspectionCertificate} className="absolute inset-0 w-full h-full object-cover" />
                        <button type="button" onClick={() => removeDoc('inspectionCertificate')} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors z-10"><X size={14}/></button>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="text-gray-300 group-hover:text-red-500 mb-2 transition-colors" size={32} />
                        <span className="text-[10px] font-bold text-gray-400">Bấm tải ảnh lên</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" onChange={(e) => handleDocUpload(e, 'inspectionCertificate')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    3. Bảo hiểm xe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 bg-white rounded-2xl p-4 flex flex-col items-center justify-center h-40 hover:bg-red-50 hover:border-red-400 transition-all group overflow-hidden shadow-inner">
                    {formData.insurancePaper ? (
                      <>
                        <img src={formData.insurancePaper} className="absolute inset-0 w-full h-full object-cover" />
                        <button type="button" onClick={() => removeDoc('insurancePaper')} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors z-10"><X size={14}/></button>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="text-gray-300 group-hover:text-red-500 mb-2 transition-colors" size={32} />
                        <span className="text-[10px] font-bold text-gray-400">Bấm tải ảnh lên</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" onChange={(e) => handleDocUpload(e, 'insurancePaper')} />
                  </div>
                </div>
              </div>
            </div>

            {/*  KHỐI XÁC NHẬN HỢP ĐỒNG ĐIỆN TỬ */}
            <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in fade-in">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    id="agreeContract"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="agreeContract" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Tôi cam kết thông tin cung cấp là chính xác và đồng ý ký xác nhận 
                    {/*  SỬA LINK THÀNH BẢN MẪU (TEMPLATE) */}
                    <Link href="/partner/contract" target="_blank" className="text-blue-600 font-bold underline hover:text-blue-800 mx-1">
                      Hợp đồng hợp tác điện tử
                    </Link> 
                    của ViVuCar.
                  </label>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    * Bằng việc tích chọn, bạn đã thực hiện hành vi ký điện tử. Sau khi hệ thống cấp mã ID xe thành công, hợp đồng chính thức ghi nhận thông tin của bạn sẽ được tạo lập tự động. Bạn có thể xem và in hợp đồng tại trang Quản lý xe.
                  </p>
                </div>
              </div>
            </div>

            {/* NÚT SUBMIT ĐÃ BỔ SUNG ĐIỀU KIỆN KHÓA */}
            <button 
              type="submit" 
              disabled={!isAgreed || isSubmitting} 
              className="w-full mt-6 bg-blue-900 text-white font-black py-4 rounded-xl hover:bg-blue-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed uppercase flex justify-center items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin"/> : "GỬI YÊU CẦU DUYỆT XE & ĐÓNG KÝ QUỸ"}
            </button>
          </form>
        )}

        {/* ================= BƯỚC 4: THÀNH CÔNG ================= */}
        {step === 4 && (
           <div className="text-center py-12 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={48} className="text-green-500" /></div>
              <h2 className="text-3xl font-black text-blue-900 uppercase italic">Gửi hồ sơ thành công!</h2>
              <p className="text-gray-500 font-bold mt-2">Hệ thống sẽ đối soát giao dịch ký quỹ và kiểm duyệt pháp lý xe của bạn trong vòng 2-4 tiếng làm việc.</p>
              <div className="flex gap-4 justify-center mt-8">
                <button onClick={() => {
                  setStep(1); 
                  setIsAgreed(false);
                  setFormData(prev => ({
                    ...prev, licensePlate: "", carModel: "", description: "", 
                    images: [], registrationPaper: "", inspectionCertificate: "", insurancePaper: "",
                    priceOriginal: "", priceDiscount: ""
                  }));
                }} className="px-8 py-4 bg-gray-100 text-gray-500 font-black uppercase italic rounded-2xl text-[10px] hover:bg-gray-200">Đăng ký thêm</button>
                <button onClick={() => router.push("/partner/dashboard")} className="px-8 py-4 bg-blue-600 text-white font-black uppercase italic rounded-2xl text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700">Quản lý đội xe</button>
              </div>
           </div>
        )}
      </div>

      {/*  MODAL HƯỚNG DẪN CHUYỂN KHOẢN KÝ QUỸ */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-black text-blue-900 uppercase mb-2">Đăng ký hồ sơ thành công!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Hệ thống đã ghi nhận hồ sơ xe của bạn. Để xe được duyệt và bắt đầu cho thuê, vui lòng hoàn tất nộp phí ký quỹ trách nhiệm.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left mb-6">
              <div className="space-y-3 text-sm">
                <p className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Số tiền:</span> <strong className="text-red-600 text-lg">2.000.000 VNĐ</strong></p>
                <p className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Ngân hàng:</span> <strong>MB Bank</strong></p>
                <p className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Số tài khoản:</span> <strong>0123456789</strong></p>
                <p className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Chủ tài khoản:</span> <strong>CTY AUTOHUB AI</strong></p>
                <p className="flex justify-between items-center pt-1"><span className="text-gray-500">Nội dung CK:</span> <strong className="text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-100">KYQUY {formData.licensePlate}</strong></p>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowDepositModal(false);
                setStep(4);
              }} 
              className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-all uppercase tracking-widest text-sm"
            >
              Tôi Đã Nắm Thông Tin
            </button>
            <p className="text-[10px] text-gray-400 mt-4 italic">
              * Giao dịch của bạn sẽ được bảo mật tuyệt đối bởi nền tảng.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
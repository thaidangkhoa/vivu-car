/* eslint-disable */
// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Save, ChevronLeft, ImagePlus, X, AlertCircle,Loader2 } from "lucide-react";
import Link from "next/link";

// --- DANH SÁCH DỮ LIỆU ĐỂ RENDER SELECT BOX CHO NHANH ---
const BRANDS = ["Toyota", "VinFast", "Hyundai", "Ford", "Mitsubishi", "Kia", "Mazda", "Honda", "Suzuki", "MG", "Peugeot", "Mercedes", "BMW", "Audi", "Lexus", "Porsche", "LandRover", "Nissan", "Subaru", "Volvo", "Volkswagen", "Chevrolet", "BYD", "Khac"];
const CATEGORIES = [
  { id: "Sedan", name: "Sedan" }, { id: "SUV", name: "SUV" }, { id: "Hatchback", name: "Hatchback" },
  { id: "MPV", name: "MPV" }, { id: "Pickup", name: "Bán tải" }, { id: "Sport", name: "Xe thể thao" }
];
const TIERS = [
  { id: "Budget", name: "Bình dân" }, { id: "Standard", name: "Phổ thông" }, { id: "Luxury", name: "Hạng sang" }
];
const LOCATIONS = [
  { id: "HaNoi", name: "Hà Nội" }, { id: "TPHCM", name: "TP. Hồ Chí Minh" }, { id: "DaNang", name: "Đà Nẵng" },
  { id: "NhaTrang", name: "Nha Trang" }, { id: "PhuQuoc", name: "Phú Quốc" }, { id: "DaLat", name: "Đà Lạt" },
  { id: "HaLong", name: "Hạ Long" }, { id: "VungTau", name: "Vũng Tàu" }, { id: "CanTho", name: "Cần Thơ" },
  { id: "HoiAn", name: "Hội An" }, { id: "Hue", name: "Huế" }, { id: "QuyNhon", name: "Quy Nhơn" }
];
const AMENITIES_LIST = ["Bản đồ", "Bluetooth", "Camera lùi", "Cảm biến lốp", "Cửa sổ trời", "Định vị GPS", "Khe cắm USB", "Lốp dự phòng"];

export default function AddCarAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "", priceOriginal: "", priceDiscount: "",
    brand: "Toyota", category: "Sedan", tier: "Standard",
    transmission: "Automatic", fuel: "Gasoline", location: "HaNoi",
    seats: 4, address: "", deliveryFee: 0, 
    amenities: [], // Đổi thành mảng để lưu tiện nghi
    rules: "Giữ vệ sinh xe sạch sẽ, không hút thuốc. Trả xe đúng giờ (quá giờ phụ thu 100k/giờ).", 
    requirements: "Bản gốc GPLX hạng B2 trở lên, CCCD gắn chíp (đối chiếu). Thế chấp 15 triệu đồng hoặc xe máy chính chủ.",
    images: [] // Đổi sang mảng lưu ảnh Base64
  });

  const handleChange = (e: any) => {
    let { name, value } = e.target;
    
    // Chỉ cho phép nhập số ở các trường giá tiền
    if (['priceOriginal', 'priceDiscount', 'deliveryFee'].includes(name)) {
      value = value.replace(/[^0-9]/g, ''); 
    }

    setFormData({ ...formData, [name]: value });
    
    // Xóa lỗi khi user bắt đầu gõ lại
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  //  HÀM QUẢN LÝ TIỆN NGHI (TAGS)
  const toggleAmenity = (name: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(name) 
        ? prev.amenities.filter(a => a !== name) 
        : [...prev.amenities, name]
    }));
  };

  //  HÀM QUẢN LÝ TẢI ẢNH BẰNG GIAO DIỆN KÉO THẢ
  const handleImageUpload = async (e: any) => {
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

  const removeImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const pOriginal = Number(formData.priceOriginal);
    const pDiscount = Number(formData.priceDiscount);
    
    if (!pOriginal) return setErrors({ priceOriginal: "Vui lòng nhập giá gốc!" });
    if (pDiscount > 0 && pDiscount > pOriginal) {
      return setErrors({ priceDiscount: "Giá khuyến mãi không được lớn hơn giá gốc!" });
    }
    if (formData.images.length === 0) {
      return alert("Vui lòng tải lên ít nhất 1 ảnh cho chiếc xe này!");
    }

    setLoading(true);

    //  BƯỚC QUAN TRỌNG: Tách 'images' ra khỏi dữ liệu gửi đi
    const { images, ...restFormData } = formData; 

    const dbPayload = {
      ...restFormData, // Chỉ lấy những trường hợp lệ (name, brand, category...)
      priceOriginal: pOriginal,
      priceDiscount: pDiscount > 0 ? pDiscount : pOriginal,
      seats: Number(formData.seats),
      deliveryFee: Number(formData.deliveryFee),
      image: images[0] || "", // Ảnh đầu tiên là ảnh chính
      gallery: images.slice(1) || [], // Các ảnh còn lại vào gallery
      amenities: formData.amenities.join(", ") 
    };

    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload), // Lúc này payload đã sạch sẽ, không còn trường 'images'
      });

      if (res.ok) {
        alert("Đã thêm xe mới thành công! 🎉");
        router.push("/admin/cars"); 
        router.refresh();           
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.error || "Có lỗi xảy ra khi thêm xe."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-6 hover:text-blue-600 w-fit">
          <ChevronLeft size={16} /> Quay lại Dashboard
        </Link>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter flex items-center gap-3 mb-8">
            <CarFront className="text-blue-600" size={32} /> Thêm xe Hệ Thống (Công Ty)
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. THÔNG TIN CƠ BẢN & GIÁ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-blue-50/30 rounded-[32px] border border-blue-50">
              <h2 className="col-span-full text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Thông tin & Giá thuê</h2>
              
              <div className="col-span-full">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Tên xe <span className="text-red-500">*</span></label>
                <input required name="name" onChange={handleChange} className="w-full mt-2 p-4 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none focus:border-blue-500" placeholder="Vd: VinFast VF8 Plus 2024" />
              </div>
              
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Giá gốc (VNĐ/ngày) <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.priceOriginal} name="priceOriginal" onChange={handleChange} className={`w-full mt-2 p-4 rounded-xl border bg-white font-black text-blue-600 text-lg outline-none ${errors.priceOriginal ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="800000" />
                {errors.priceOriginal && <p className="text-red-500 text-[10px] font-bold italic mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.priceOriginal}</p>}
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Giá khuyến mãi (VNĐ/ngày)</label>
                <input type="text" value={formData.priceDiscount} name="priceDiscount" onChange={handleChange} className={`w-full mt-2 p-4 rounded-xl border bg-white font-black text-green-600 text-lg outline-none ${errors.priceDiscount ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Để trống nếu không giảm giá" />
                {errors.priceDiscount && <p className="text-red-500 text-[10px] font-bold italic mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.priceDiscount}</p>}
              </div>
            </div>

            {/* 2. QUẢN LÝ HÌNH ẢNH (GALLERY GIAO DIỆN CHUẨN) */}
            <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Hình ảnh xe (Tối đa 5 ảnh) <span className="text-red-500">*</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.length < 5 && (
                      <label className="border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer h-28 relative transition-all">
                          <ImagePlus className="text-blue-500 mb-1" size={24} />
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Tải ảnh lên</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                  )}
                  {formData.images.map((img, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden h-28 group border border-gray-200 shadow-sm">
                          <img src={img} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><X/></button>
                          {idx === 0 && <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">Ảnh chính</span>}
                      </div>
                  ))}
              </div>
            </div>

            {/* 3. PHÂN LOẠI & THÔNG SỐ KỸ THUẬT */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <h2 className="col-span-full text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Phân loại & Kỹ thuật</h2>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hãng xe</label>
                <select name="brand" onChange={handleChange} className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none focus:border-blue-500">
                  {BRANDS.map(brand => <option key={brand} value={brand}>{brand === "LandRover" ? "Land Rover" : brand}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kiểu xe</label>
                <select name="category" onChange={handleChange} className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none focus:border-blue-500">
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phân khúc</label>
                <select name="tier" onChange={handleChange} className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none focus:border-blue-500">
                  {TIERS.map(tier => <option key={tier.id} value={tier.id}>{tier.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số chỗ ngồi</label>
                <input required type="number" name="seats" defaultValue={4} onChange={handleChange} className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hộp số</label>
                <select name="transmission" onChange={handleChange} className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none focus:border-blue-500">
                  <option value="Automatic">Tự động</option>
                  <option value="Manual">Số sàn</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhiên liệu</label>
                <select name="fuel" onChange={handleChange} className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none focus:border-blue-500">
                  <option value="Gasoline">Xăng</option>
                  <option value="Diesel">Dầu</option>
                  <option value="Electric">Điện</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* 4. VỊ TRÍ & GIAO NHẬN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-orange-50/30 rounded-[32px] border border-orange-50">
              <h2 className="col-span-full text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-2">Vị trí & Giao nhận</h2>
              
              <div className="col-span-full">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Địa chỉ bãi xe chính xác <span className="text-red-500">*</span></label>
                <input required name="address" onChange={handleChange} className="w-full mt-2 p-4 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none focus:border-orange-400" placeholder="123 Lê Lợi, TP. Đông Hà, Quảng Trị" />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Thành phố</label>
                <select name="location" onChange={handleChange} className="w-full mt-2 p-4 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none focus:border-orange-400">
                  {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Phí giao xe (Nhập 0 nếu miễn phí) <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.deliveryFee} name="deliveryFee" onChange={handleChange} className="w-full mt-2 p-4 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none focus:border-orange-400" />
              </div>
            </div>

            {/* 5. TIỆN NGHI & ĐIỀU KHOẢN (ĐÃ FIX GIỐNG PARTNER) */}
            <div className="grid grid-cols-1 gap-6 p-8 bg-green-50/30 rounded-[32px] border border-green-50">
              <h2 className="col-span-full text-xs font-black text-green-500 uppercase tracking-[0.2em] mb-2">Tiện nghi & Điều khoản</h2>
              
              <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Tiện nghi nổi bật</label>
                  <div className="flex flex-wrap gap-2">
                      {AMENITIES_LIST.map(item => (
                      <button 
                        type="button" 
                        key={item} 
                        onClick={() => toggleAmenity(item)} 
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black tracking-wider border transition-all ${formData.amenities.includes(item) ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}
                      >
                        {item}
                      </button>
                      ))}
                  </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Giấy tờ yêu cầu</label>
                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full mt-2 p-4 rounded-xl border border-gray-200 bg-white font-medium text-sm outline-none focus:border-green-400 min-h-[100px]" />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Lưu ý & Phụ thu</label>
                <textarea name="rules" value={formData.rules} onChange={handleChange} className="w-full mt-2 p-4 rounded-xl border border-gray-200 bg-white font-medium text-sm outline-none focus:border-green-400 min-h-[100px]" />
              </div>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-5 bg-blue-900 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> Xác nhận đưa xe lên hệ thống</>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
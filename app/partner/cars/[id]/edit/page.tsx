/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Save, ChevronLeft, FileText, ShieldCheck, UploadCloud, X, ImagePlus } from "lucide-react";
import Link from "next/link";

const BRANDS = ["Toyota", "VinFast", "Hyundai", "Ford", "Mitsubishi", "Kia", "Mazda", "Honda", "Suzuki", "MG", "Peugeot", "Mercedes", "BMW", "Audi", "Lexus", "Porsche", "LandRover", "Nissan", "Subaru", "Volvo", "Volkswagen", "Tesla", "BYD", "Khac"];
const CATEGORIES = [ { id: "Sedan", name: "Sedan" }, { id: "SUV", name: "SUV" }, { id: "Hatchback", name: "Hatchback" }, { id: "MPV", name: "MPV" }, { id: "Pickup", name: "Bán tải" }, { id: "Sport", name: "Xe thể thao" } ];
const TIERS = [ { id: "Budget", name: "Bình dân" }, { id: "Standard", name: "Phổ thông" }, { id: "Luxury", name: "Hạng sang" } ];
const LOCATIONS = [ { id: "HaNoi", name: "Hà Nội" }, { id: "TPHCM", name: "TP. Hồ Chí Minh" }, { id: "DaNang", name: "Đà Nẵng" }, { id: "NhaTrang", name: "Nha Trang" }, { id: "PhuQuoc", name: "Phú Quốc" }, { id: "DaLat", name: "Đà Lạt" }, { id: "HaLong", name: "Hạ Long" }, { id: "VungTau", name: "Vũng Tàu" }, { id: "CanTho", name: "Cần Thơ" }, { id: "HoiAn", name: "Hội An" }, { id: "Hue", name: "Huế" }, { id: "QuyNhon", name: "Quy Nhơn" } ];

export default function PartnerEditCarPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const carId = resolvedParams?.id;

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    name: "", priceOriginal: 0, priceDiscount: 0,
    brand: "Toyota", category: "Sedan", tier: "Standard",
    transmission: "Automatic", fuel: "Gasoline", location: "HaNoi",
    seats: 4, address: "", deliveryFee: 0, description: "",
    amenities: "", rules: "", requirements: "",
    licensePlate: "", ownerCCCD: "",
    images: [], //  BỔ SUNG STATE LƯU MẢNG ẢNH HIỂN THỊ
    registrationPaper: "", inspectionCertificate: "", insurancePaper: ""
  });

  useEffect(() => {
    if (!carId) return;
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (res.ok) {
          const data = await res.json();
          
          let safeGallery = [];
          try { safeGallery = Array.isArray(data.gallery) ? data.gallery : JSON.parse(data.gallery || "[]"); } catch(e) {}
          let safeAmenities = [];
          try { safeAmenities = Array.isArray(data.amenities) ? data.amenities : JSON.parse(data.amenities || "[]"); } catch(e) {}

          //  GỘP ẢNH CHÍNH VÀ ẢNH PHỤ VÀO 1 MẢNG ĐỂ HIỂN THỊ
          const loadedImages = [data.image, ...safeGallery].filter(Boolean);

          setFormData({
            ...data,
            images: loadedImages,
            amenities: safeAmenities.join(", "),
            address: data.address || "",
            description: data.description || "",
            rules: data.rules || "",
            requirements: data.requirements || "",
            deliveryFee: data.deliveryFee || 0,
            licensePlate: data.licensePlate || "",
            ownerCCCD: data.ownerCCCD || "",
            registrationPaper: data.registrationPaper || "",
            inspectionCertificate: data.inspectionCertificate || "",
            insurancePaper: data.insurancePaper || ""
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoad(false);
      }
    };
    fetchCar();
  }, [carId]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  HÀM UPLOAD NHIỀU ẢNH XE (GIỐNG TRANG ĐĂNG KÝ)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) return alert("Tối đa 5 ảnh hiển thị");
    
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

  // HÀM UPLOAD GIẤY TỜ
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.registrationPaper) return alert("Vui lòng tải lên mặt trước Giấy đăng ký xe (Cà vẹt)!");
    if (!formData.inspectionCertificate) return alert("Vui lòng tải lên Giấy chứng nhận Đăng kiểm!");
    if (!formData.insurancePaper) return alert("Vui lòng tải lên Bảo hiểm xe!");
    if (formData.images.length === 0) return alert("Vui lòng tải lên ít nhất 1 ảnh hiển thị xe!");
    setLoading(true);

    // Tách riêng images ra khỏi phần còn lại của formData
    const { images, ...restFormData } = formData;

    const payload = {
      ...restFormData, // Chỉ gửi các trường còn lại
      priceOriginal: Number(formData.priceOriginal) || 0,
      priceDiscount: Number(formData.priceDiscount) || 0,
      seats: Number(formData.seats) || 5,
      deliveryFee: Number(formData.deliveryFee) || 0,
      
      // Gán đúng tên cột cho Prisma
      image: images[0] || "",
      gallery: images.slice(1) || [],

      amenities: formData.amenities.split(',').map(item => item.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Đã cập nhật thông tin xe thành công! 🎉");
        router.push("/partner/dashboard"); 
        router.refresh(); 
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.error || "Không thể cập nhật"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-widest text-xl">Đang tải hồ sơ xe...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-28">
      <div className="max-w-5xl mx-auto">
        <Link href="/partner/dashboard" className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-6 hover:text-blue-600">
          <ChevronLeft size={16} /> Quay lại Quản lý đội xe
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter flex items-center gap-3 mb-8">
            <CarFront className="text-blue-600" /> Cập nhật xe của tôi #{carId}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. THÔNG TIN ĐỊNH DANH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-yellow-50/50 rounded-2xl border border-yellow-100">
              <h2 className="col-span-full text-sm font-black text-yellow-600 uppercase tracking-widest flex items-center gap-2"><FileText size={18}/> Định danh cơ bản</h2>
              <div>
                <label className="text-xs font-bold text-gray-700">Biển số xe</label>
                <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white uppercase font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">CCCD Chủ xe</label>
                <input name="ownerCCCD" value={formData.ownerCCCD} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>
            </div>

            {/* 2. THÔNG TIN CƠ BẢN & HÌNH ẢNH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl">
              <h2 className="col-span-full text-sm font-black text-gray-400 uppercase tracking-widest">Thông tin & Hình ảnh</h2>
              
              <div className="col-span-full">
                <label className="text-xs font-bold text-gray-700">Tên xe</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-700">Giá gốc (VNĐ/ngày)</label>
                <input required type="number" name="priceOriginal" value={formData.priceOriginal} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Giá khuyến mãi (VNĐ/ngày)</label>
                <input required type="number" name="priceDiscount" value={formData.priceDiscount} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>

              <div className="col-span-full">
                <label className="text-xs font-bold text-gray-700">Mô tả xe</label>
                <textarea rows={3} name="description" value={formData.description} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>

              {/*  GIAO DIỆN UPLOAD ẢNH HIỂN THỊ NHƯ BÊN TRANG ĐĂNG KÝ */}
              <div className="col-span-full border-t border-gray-200 pt-6 mt-2">
                <label className="text-xs font-bold text-gray-700 mb-3 block">Hình ảnh hiển thị (Tối đa 5 ảnh) <span className="text-red-500">*</span></label>
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
            </div>

            {/* 3. PHÂN LOẠI & THÔNG SỐ KỸ THUẬT */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h2 className="col-span-full text-sm font-black text-blue-500 uppercase tracking-widest">Phân loại & Kỹ thuật</h2>
              
              <div>
                <label className="text-xs font-bold text-gray-700">Hãng xe</label>
                <select name="brand" value={formData.brand} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white">
                  {BRANDS.map(brand => <option key={brand} value={brand}>{brand === "LandRover" ? "Land Rover" : brand}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Kiểu xe</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white">
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Phân khúc</label>
                <select name="tier" value={formData.tier} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white">
                  {TIERS.map(tier => <option key={tier.id} value={tier.id}>{tier.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Số chỗ ngồi</label>
                <input required type="number" name="seats" value={formData.seats} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Hộp số</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white">
                  <option value="Automatic">Tự động</option>
                  <option value="Manual">Số sàn</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Nhiên liệu</label>
                <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white">
                  <option value="Gasoline">Xăng</option>
                  <option value="Diesel">Dầu</option>
                  <option value="Electric">Điện</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* 4. VỊ TRÍ & GIAO NHẬN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
              <h2 className="col-span-full text-sm font-black text-orange-500 uppercase tracking-widest">Vị trí & Giao nhận</h2>
              
              <div className="col-span-full">
                <label className="text-xs font-bold text-gray-700">Địa chỉ bãi xe chính xác</label>
                <input required name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Thành phố</label>
                <select name="location" value={formData.location} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white">
                  {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Phí giao xe tận nhà</label>
                <input required type="number" name="deliveryFee" value={formData.deliveryFee} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>
            </div>

            {/* 5. TIỆN NGHI & ĐIỀU KHOẢN */}
            <div className="grid grid-cols-1 gap-6 p-6 bg-green-50/50 rounded-2xl border border-green-100">
              <h2 className="col-span-full text-sm font-black text-green-600 uppercase tracking-widest">Tiện nghi & Điều khoản</h2>
              
              <div>
                <label className="text-xs font-bold text-gray-700">Tiện nghi nổi bật</label>
                <input name="amenities" value={formData.amenities} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Giấy tờ yêu cầu</label>
                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white h-20" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Lưu ý & Phụ thu</label>
                <textarea name="rules" value={formData.rules} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border bg-white h-20" />
              </div>
            </div>

            {/* 6. KHU VỰC CẬP NHẬT GIẤY TỜ PHÁP LÝ */}
            <div className="bg-red-50/50 p-6 rounded-[24px] border border-red-100 mb-8">
              <div className="mb-6">
                <h3 className="text-lg font-black text-red-700 uppercase italic flex items-center gap-2">
                  <ShieldCheck size={20} /> Cập nhật Hồ sơ pháp lý
                </h3>
                <p className="text-xs text-red-600/80 font-medium mt-1">
                  Chỉ cập nhật khi bạn vừa mới thay đổi/gia hạn giấy tờ pháp lý của xe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    1. Mặt trước Cà vẹt
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
                        <span className="text-[10px] font-bold text-gray-400">Bấm tải ảnh mới</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" onChange={(e) => handleDocUpload(e, 'registrationPaper')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    2. Giấy Đăng kiểm
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
                        <span className="text-[10px] font-bold text-gray-400">Bấm tải ảnh mới</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" onChange={(e) => handleDocUpload(e, 'inspectionCertificate')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    3. Bảo hiểm
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
                        <span className="text-[10px] font-bold text-gray-400">Bấm tải ảnh mới</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" onChange={(e) => handleDocUpload(e, 'insurancePaper')} />
                  </div>
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
              <Save size={20} /> {loading ? "Đang lưu thay đổi..." : "Lưu cập nhật xe"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
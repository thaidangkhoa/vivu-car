/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import CarCard from "./CarCard";
import { X, Car as CarIcon, ChevronDown, Search, MapPin, ShieldCheck, Users } from "lucide-react";

// --- COMPONENT MENU THẢ XUỐNG CÓ TÌM KIẾM ---
function SearchableDropdown({ label, icon: Icon, options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic hidden sm:block">
        {label}:
      </span>
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-44 sm:w-52 bg-white px-4 py-3 rounded-2xl shadow-sm border transition-all duration-300 ${value ? 'border-blue-500 text-blue-600 shadow-blue-50' : 'border-gray-100 text-gray-500 hover:border-blue-300'}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon size={14} className={value ? "text-blue-500" : "text-gray-400"} />
            <span className="text-[10px] font-black uppercase italic truncate">
              {value || placeholder}
            </span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Nhập để tìm nhanh..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-[11px] font-bold outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
            
            <div className="max-h-56 overflow-y-auto p-1 scrollbar-hide">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      onChange(opt === value ? "" : opt); 
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${value === opt ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    {opt}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-[10px] font-bold text-gray-400 italic">
                  Không tìm thấy kết quả phù hợp
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENT CHÍNH ---
export default function CarSection({ title, subTitle, cars = [], showFilters = true }) {
  const [activeFilters, setActiveFilters] = useState({
    location: "",     
    brand: "",        
    category: "",     
    transmission: "", 
    fuel: "",         
    tier: "",         
    seats: ""         //  Đã khai báo biến lưu số chỗ
  });

  const availableLocations = useMemo(() => {
    const locs = cars.map(car => car.location).filter(Boolean);
    return Array.from(new Set(locs)).sort(); 
  }, [cars]);

  const availableBrands = useMemo(() => {
    const brs = cars.map(car => car.brand).filter(Boolean);
    return Array.from(new Set(brs)).sort(); 
  }, [cars]);

  // LOGIC LỌC DỮ LIỆU
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (activeFilters.location && car.location !== activeFilters.location) return false;
      if (activeFilters.brand && car.brand !== activeFilters.brand) return false;
      if (activeFilters.category && car.category !== activeFilters.category) return false;
      if (activeFilters.transmission && car.transmission !== activeFilters.transmission) return false;
      if (activeFilters.fuel && car.fuel !== activeFilters.fuel) return false;
      if (activeFilters.tier && car.tier !== activeFilters.tier) return false;
      //  XỬ LÝ LỌC SỐ CHỖ Ở ĐÂY
      if (activeFilters.seats && car.seats !== parseInt(activeFilters.seats)) return false;
      return true;
    });
  }, [cars, activeFilters]);

  const toggleFilter = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? "" : value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({ location: "", brand: "", category: "", transmission: "", fuel: "", tier: "", seats: "" });
  }

  return (
    <section className="py-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 uppercase italic tracking-tighter mb-2 leading-none">
            {title}
          </h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">{subTitle}</p>
        </div>
        
        {showFilters && Object.values(activeFilters).some(val => val !== "") && (
            <button 
                onClick={resetFilters}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-5 py-3 rounded-2xl transition-all shadow-sm"
            >
                <X size={14} strokeWidth={3} /> Làm mới bộ lọc
            </button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-col gap-5 mb-12">
          
          {/* HÀNG 1: ĐỊA ĐIỂM & THƯƠNG HIỆU */}
          <div className="flex flex-wrap gap-4 items-center relative z-20">
              <SearchableDropdown 
                label="Nơi nhận xe" 
                icon={MapPin} 
                options={availableLocations} 
                value={activeFilters.location} 
                onChange={(val) => toggleFilter("location", val)}
                placeholder="Tất cả địa điểm"
              />

              <SearchableDropdown 
                label="Hãng xe" 
                icon={ShieldCheck} 
                options={availableBrands}    
                value={activeFilters.brand} 
                onChange={(val) => toggleFilter("brand", val)}
                placeholder="Tất cả hãng xe"
              />
          </div>

          {/* HÀNG 2: KIỂU XE */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2 italic hidden sm:block">Kiểu xe:</span>
              <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
                  {[
                      { label: "Sedan", value: "Sedan" },
                      { label: "SUV", value: "SUV" },
                      { label: "Hatchback", value: "Hatchback" },
                      { label: "MPV", value: "MPV" },
                      { label: "Bán tải", value: "Pickup" },
                      { label: "Thể thao", value: "Sport" }
                  ].map((item) => (
                      <button 
                          key={item.value}
                          onClick={() => toggleFilter("category", item.value)}
                          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic transition-all ${activeFilters.category === item.value ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                      >
                          {item.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* HÀNG 3: CÁC THÔNG SỐ KHÁC */}
          <div className="flex flex-wrap gap-4 items-center">
              
              {/*  THÊM BỘ LỌC SỐ CHỖ Ở ĐÂY */}
              <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
                  {[4, 5, 7, 9, 16].map((seat) => (
                    <button 
                      key={seat}
                      onClick={() => toggleFilter("seats", seat.toString())} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all flex items-center gap-1 ${activeFilters.seats === seat.toString() ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-orange-500"}`}
                    >
                      {seat} Chỗ
                    </button>
                  ))}
              </div>

              <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
                  <button onClick={() => toggleFilter("tier", "Luxury")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.tier === "Luxury" ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Hạng sang</button>
                  <button onClick={() => toggleFilter("tier", "Standard")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.tier === "Standard" ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Phổ thông</button>
                  <button onClick={() => toggleFilter("tier", "Budget")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.tier === "Budget" ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Bình dân</button>
              </div>

              <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
                  <button onClick={() => toggleFilter("transmission", "Automatic")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.transmission === "Automatic" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Tự động</button>
                  <button onClick={() => toggleFilter("transmission", "Manual")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.transmission === "Manual" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Số sàn</button>
              </div>

              <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
                  <button onClick={() => toggleFilter("fuel", "Gasoline")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.fuel === "Gasoline" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Xăng</button>
                  <button onClick={() => toggleFilter("fuel", "Diesel")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.fuel === "Diesel" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Dầu</button>
                  <button onClick={() => toggleFilter("fuel", "Electric")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.fuel === "Electric" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Điện</button>
                  <button onClick={() => toggleFilter("fuel", "Hybrid")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeFilters.fuel === "Hybrid" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-blue-600"}`}>Hybrid</button>
              </div>
          </div>
        </div>
      )}

      {/* LƯỚI HIỂN THỊ XE */}
      { (showFilters ? filteredCars : cars).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 relative z-0">
          {(showFilters ? filteredCars : cars).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] py-32 text-center border-2 border-dashed border-gray-100 shadow-inner">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-black uppercase italic tracking-[0.3em] text-sm">Rất tiếc, chưa tìm thấy xe phù hợp!</p>
          {showFilters && (
            <button onClick={resetFilters} className="mt-6 bg-blue-50 text-blue-600 px-8 py-3 rounded-2xl font-black uppercase italic text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-50">Làm mới bộ lọc</button>
          )}
        </div>
      )}
    </section>
  );
}
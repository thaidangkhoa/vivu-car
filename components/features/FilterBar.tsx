/* eslint-disable */
// @ts-nocheck
"use client";

import { Zap, Users, Fuel, Settings, Star, Car, Leaf } from "lucide-react"; // Thêm Leaf cho "xịn"

const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'sale', label: 'Ưu đãi %', icon: Zap, activeColor: 'text-red-500' },
  
  // Nhóm Phân khúc (Tier)
  { id: 'tier_budget', label: 'Bình dân', icon: Star },
  { id: 'tier_standard', label: 'Phổ thông', icon: Star },
  { id: 'tier_luxury', label: 'Hạng sang', icon: Star, activeColor: 'text-yellow-500' },

  // Nhóm Kỹ thuật & Kiểu dáng
  { id: 'cat_suv', label: 'Dòng SUV', icon: Car },
  { id: 'seats_5', label: 'Xe 4-5 chỗ', icon: Users },
  { id: 'seats_7', label: 'Xe 7 chỗ', icon: Users },
  { id: 'trans_auto', label: 'Số tự động', icon: Settings },
  { id: 'trans_manual', label: 'Số sàn', icon: Settings },

  // Nhóm Nhiên liệu -  ĐÃ TÁCH RIÊNG HYBRID
  { id: 'fuel_gas', label: 'Máy Xăng', icon: Fuel },
  { id: 'fuel_diesel', label: 'Máy Dầu', icon: Fuel },
  { id: 'fuel_ev', label: 'Xe Điện', icon: Zap, activeColor: 'text-blue-400' },
  { id: 'fuel_hybrid', label: 'Xe Hybrid', icon: Fuel, activeColor: 'text-emerald-500' }, 
];

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Bộ lọc thông minh</span>
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2
                ${isActive 
                  ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100 scale-105" 
                  : "bg-white text-gray-500 border-gray-100 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {Icon && <Icon size={14} className={isActive ? "text-white" : filter.activeColor || "text-gray-400"} />}
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
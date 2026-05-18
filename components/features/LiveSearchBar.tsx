"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function LiveSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy giá trị tên xe hiện tại trên URL (nếu có) để làm giá trị mặc định
  const initialSearch = searchParams.get('name') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    //  KỸ THUẬT DEBOUNCE: Đợi 400ms sau khi người dùng ngừng gõ mới cập nhật URL
    // Giúp trang web cực mượt và không bị "Spam" Database
    const delayDebounceFn = setTimeout(() => {
      const currentName = searchParams.get('name') || '';

      if (currentName !== searchTerm) {
        // Clone lại toàn bộ bộ lọc cũ (địa điểm, hãng, ngày...)
        const params = new URLSearchParams(searchParams.toString());
        
        if (searchTerm) {
          params.set('name', searchTerm);
        } else {
          params.delete('name');
        }
        
        // Cập nhật URL trong im lặng, không tải lại trang (scroll: false)
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Nhập tên xe (VD: Mazda 3, Cross...)"
        className="w-full pl-11 pr-4 py-3 rounded-[16px] bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold text-blue-950 placeholder:text-gray-400 placeholder:font-medium"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    </div>
  );
}
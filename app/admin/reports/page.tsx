/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, Calendar, BarChart3, PieChart as PieChartIcon, 
  Download, ArrowUpRight, MapPin, Star, MessageSquare, Loader2, Filter
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const PIE_COLORS = ['#3b82f6', '#10b981'];

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingsData, setBookingsData] = useState([]); 

  const [filterType, setFilterType] = useState("ALL"); 
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/reports');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setBookingsData(json.data.rawBookings || []); 
        }
      } catch (error) {
        console.error("Lỗi tải báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  //  BỘ NÃO LỌC DỮ LIỆU (ĐÃ ĐỒNG BỘ 100% VỚI API)
  const filteredStats = useMemo(() => {
    if (!data) return null;

    const validBookings = bookingsData.filter(b => b.status === "COMPLETED").filter(b => {
      if (filterType === "ALL") return true;

      const endDate = new Date(b.endDate);
      const bYear = endDate.getFullYear();
      const bMonth = endDate.getMonth() + 1;
      const bDay = endDate.getDate();

      const targetDate = new Date(dateValue);
      const tYear = targetDate.getFullYear();
      const tMonth = targetDate.getMonth() + 1;
      const tDay = targetDate.getDate();

      if (filterType === "YEAR") return bYear === tYear;
      if (filterType === "MONTH") return bYear === tYear && bMonth === tMonth;
      if (filterType === "DAY") return bYear === tYear && bMonth === tMonth && bDay === tDay;
      return true;
    });

    if (filterType === "ALL") {
      return {
        totalGmv: data.kpis.totalGmv,
        profitSystem: data.kpis.profitSystem,
        totalTrips: data.kpis.totalTrips,
        revenueData: data.revenueData,
        pieChartData: data.pieChartData,
        topCars: data.topCars
      };
    } else {
      let totalGmv = 0;
      let profitSystem = 0;
      let profitPartnerTotal = 0;
      let companyCarRevenue = 0;
      let partnerCarCommission = 0;
      
      const carStats = {}; 

      validBookings.forEach(b => {
        const amount = b.totalPrice || 0;
        totalGmv += amount;

        //  FIX 1: Phân biệt chính xác Xe Đối Tác bằng userId
        const isPartnerCar = b.car?.userId !== null && b.car?.userId !== undefined;

        //  FIX 2: Tỉ lệ chuẩn 15% Hoa hồng
        if (!isPartnerCar) {
           companyCarRevenue += amount;
           profitSystem += amount;
        } else {
           partnerCarCommission += amount * 0.15;
           profitSystem += amount * 0.15;
           profitPartnerTotal += amount * 0.85;
        }

        const carId = b.car?.id;
        if (carId) {
          if (!carStats[carId]) {
            carStats[carId] = {
              id: carId,
              name: b.car?.name || "N/A",
              owner: isPartnerCar ? "Xe Đối Tác" : "Xe Hệ Thống", // Đã đồng bộ chữ
              trips: 0,
              revenue: 0
            };
          }
          carStats[carId].trips += 1;
          carStats[carId].revenue += amount;
        }
      });

      const topCars = Object.values(carStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalGmv,
        profitSystem,
        totalTrips: validBookings.length,
        revenueData: [{
          name: filterType === "DAY" ? dateValue : (filterType === "MONTH" ? `Tháng ${dateValue.split('-')[1]}` : `Năm ${dateValue.split('-')[0]}`),
          profitSystem: profitSystem,
          profitPartner: profitPartnerTotal
        }],
        pieChartData: [
          { name: "Lãi Xe Nhà (100%)", value: companyCarRevenue },
          { name: "Hoa hồng Đối Tác (15%)", value: partnerCarCommission }
        ].filter(d => d.value > 0),
        topCars: topCars
      };
    }
  }, [data, bookingsData, filterType, dateValue]);

  //  HÀM XUẤT FILE EXCEL ĐÃ ĐƯỢC NÂNG CẤP TỐI ĐA
  const handleExport = () => {
    if (!bookingsData || bookingsData.length === 0) {
      alert("Hệ thống chưa có dữ liệu để xuất báo cáo.");
      return;
    }

    const validBookings = bookingsData.filter(b => b.status === "COMPLETED").filter(b => {
      if (filterType === "ALL") return true;
      const endDate = new Date(b.endDate);
      const bYear = endDate.getFullYear(); const bMonth = endDate.getMonth() + 1; const bDay = endDate.getDate();
      const targetDate = new Date(dateValue);
      const tYear = targetDate.getFullYear(); const tMonth = targetDate.getMonth() + 1; const tDay = targetDate.getDate();

      if (filterType === "YEAR") return bYear === tYear;
      if (filterType === "MONTH") return bYear === tYear && bMonth === tMonth;
      if (filterType === "DAY") return bYear === tYear && bMonth === tMonth && bDay === tDay;
      return true;
    });

    if (validBookings.length === 0) {
      alert(`Không có doanh thu nào trong khoảng thời gian này để xuất file!`);
      return;
    }

    // Header đầy đủ
    const headers = ["Mã Đơn", "Tên Khách Hàng", "SĐT Khách", "Tên Phương Tiện", "Biển Kiểm Soát", "Phân Loại Chủ Xe", "Ngày Hoàn Tất", "Doanh Thu (VNĐ)"];
    
    // Dữ liệu từng dòng
    const csvData = validBookings.map(b => {
      const isPartnerCar = b.car?.userId !== null && b.car?.userId !== undefined;
      return [
        `#${b.id}`,
        b.user?.name || "Khách vãng lai",
        b.user?.phone || "N/A",
        b.car?.name || "N/A",
        b.car?.licensePlate || "N/A",
        isPartnerCar ? "Xe Đối Tác" : "Xe Hệ Thống", // Đã đồng bộ chữ ở Excel
        new Date(b.endDate).toLocaleDateString('vi-VN'),
        b.totalPrice || 0
      ];
    });

    //  BỔ SUNG: Tính tổng doanh thu và chèn xuống cuối file Excel
    const totalRevenue = validBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    csvData.push(["", "", "", "", "", "", "", ""]); // Dòng trống cách điệu
    csvData.push(["", "", "", "", "", "", "TỔNG CỘNG:", totalRevenue]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...csvData.map(row => row.map(item => `"${item}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_Cao_ViVuCar_${filterType}_${dateValue}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-blue-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-sm">Đang phân tích dữ liệu hệ thống...</p>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 font-bold text-red-500">Không thể kết nối đến hệ thống máy chủ báo cáo.</div>;

  const { topLocations, ratingDistribution, recentReviews } = data; 

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1 shadow-md">
                  <BarChart3 size={12} /> Bảng điều khiển kế toán
                </span>
            </div>
            <h1 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter">
              Thống kê & Doanh thu
            </h1>
          </div>
          <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase italic shadow-lg shadow-emerald-200 transition-all active:scale-95">
            <Download size={14} /> Xuất File Báo Cáo
          </button>
        </div>

        {/* BỘ LỌC DOANH THU CHUYÊN SÂU */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 text-blue-900 font-black uppercase italic tracking-tighter">
            <Filter className="text-blue-600" /> Phân tích theo:
          </div>

          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {[
              { key: "ALL", label: "Tất cả thời gian" },
              { key: "DAY", label: "Theo Ngày" },
              { key: "MONTH", label: "Theo Tháng" },
              { key: "YEAR", label: "Theo Năm" }
            ].map(tab => (
              <button 
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${
                  filterType === tab.key ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-400 hover:bg-white hover:shadow-sm hover:text-blue-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filterType !== "ALL" && (
            <div className="flex items-center gap-3 ml-auto w-full md:w-auto">
              <Calendar className="text-gray-400" size={20} />
              <input 
                type={filterType === "MONTH" ? "month" : filterType === "YEAR" ? "number" : "date"}
                value={filterType === "YEAR" ? dateValue.substring(0,4) : filterType === "MONTH" ? dateValue.substring(0,7) : dateValue}
                onChange={(e) => {
                  if (filterType === "YEAR") setDateValue(`${e.target.value}-01-01`);
                  else if (filterType === "MONTH") setDateValue(`${e.target.value}-01`);
                  else setDateValue(e.target.value);
                }}
                className="bg-white border border-gray-200 focus:border-blue-500 rounded-xl px-4 py-2.5 font-bold text-sm text-gray-700 outline-none w-full md:w-48 shadow-sm"
                placeholder={filterType === "YEAR" ? "Nhập năm (VD: 2026)" : ""}
              />
            </div>
          )}
        </div>

        {/* 4 THẺ KPI CHÍNH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng GMV {filterType !== "ALL" && "(Lọc)"}</p>
            <p className="text-3xl font-black italic text-gray-800 mt-2 truncate" title={filteredStats?.totalGmv}>{formatCurrency(filteredStats?.totalGmv)}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1"><ArrowUpRight size={12}/> Tăng trưởng ổn định</p>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Lợi Nhuận Sàn {filterType !== "ALL" && "(Lọc)"}</p>
            <p className="text-3xl font-black italic text-blue-600 mt-2 truncate" title={filteredStats?.profitSystem}>{formatCurrency(filteredStats?.profitSystem)}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1">Thực thu vào két</p>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chuyến hoàn tất {filterType !== "ALL" && "(Lọc)"}</p>
            <p className="text-3xl font-black italic text-orange-600 mt-2">{filteredStats?.totalTrips} <span className="text-sm text-gray-300">chuyến</span></p>
            <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1"><ArrowUpRight size={12}/> Đạt KPI</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-[32px] shadow-lg text-white group hover:scale-[1.02] transition-transform">
            <p className="text-[10px] font-black text-yellow-100 uppercase tracking-widest">Đánh giá trung bình (Hệ thống)</p>
            <div className="flex items-baseline gap-2 mt-2">
               <p className="text-4xl font-black italic tracking-tighter">{data.kpis.averageRating}</p>
               <p className="text-yellow-100 font-bold">/ 5.0</p>
            </div>
            <p className="text-[10px] font-bold mt-1">Dựa trên {data.kpis.totalReviews} đánh giá</p>
          </div>
        </div>

        {/* DÒNG 1: BIỂU ĐỒ DOANH THU & CƠ CẤU */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-blue-900 uppercase italic">Tăng trưởng Lợi nhuận</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Trực quan hóa dữ liệu (VNĐ)</p>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredStats?.revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(value) => `${value / 1000000}tr`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }}/>
                  <Line type="monotone" dataKey="profitSystem" name="Lợi nhuận Hệ Thống" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="profitPartner" name="Hoa hồng Đối Tác" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full justify-between">
            {/* Header đồng bộ layout với Line Chart */}
            <div>
              <h3 className="text-lg font-black text-blue-900 uppercase italic">Cơ cấu Lợi nhuận sàn</h3>
              <p className="text-[10px] text-transparent font-bold uppercase tracking-widest mt-1 mb-6 select-none">
                Cân bằng Layout
              </p>
            </div>
            
            {/* Wrapper Chart có chiều cao cố định */}
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="h-[220px] w-full">
                {filteredStats?.pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={filteredStats.pieChartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={90} 
                        paddingAngle={5} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {filteredStats.pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-bold italic text-sm">
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
            </div>

            {/* Chú thích (Legend) được cố định ở đáy */}
            <div className="w-full mt-6 space-y-3 border-t border-gray-50 pt-4">
              {filteredStats?.pieChartData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></div>
                    <span className="font-bold text-gray-600 text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-black italic text-gray-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
          </div>

        {/* DÒNG 2: THỐNG KÊ ĐÁNH GIÁ (REVIEWS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-blue-900 uppercase italic">Phân bổ đánh giá</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-6">Mức độ hài lòng của KH (Toàn hệ thống)</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="stars" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} width={50} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" name="Số lượt" fill="#eab308" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-blue-900 uppercase italic">Feedback mới nhất</h3>
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[300px] custom-scrollbar">
              {recentReviews.length === 0 ? (
                <p className="text-center text-gray-400 font-bold py-10">Chưa có feedback nào</p>
              ) : recentReviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 p-4 rounded-[20px] hover:border-blue-100 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black italic text-xs">{review.user.charAt(0)}</div>
                      <div>
                        <p className="font-black text-blue-900 text-xs uppercase">{review.user}</p>
                        <p className="text-[10px] font-bold text-gray-400">{review.car} • {review.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-black text-yellow-600">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium italic pl-10">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DÒNG 3: XẾP HẠNG XE & ĐỊA ĐIỂM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-black text-blue-900 uppercase italic">Top Phương Tiện {filterType !== "ALL" && "(Đã lọc)"}</h3>
              <PieChartIcon size={24} className="text-orange-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="p-6">Hạng</th>
                    <th className="p-6">Dòng xe & Phân Loại</th>
                    <th className="p-6 text-center">Số chuyến</th>
                    <th className="p-6 text-right">Doanh thu tạo ra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStats?.topCars.length === 0 ? (
                     <tr><td colSpan={4} className="text-center p-10 text-gray-400 font-bold italic">Chưa có dữ liệu</td></tr>
                  ) : filteredStats?.topCars.map((car, index) => (
                    <tr key={car.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 ${index === 0 ? "bg-yellow-100 text-yellow-600" : index === 1 ? "bg-gray-200 text-gray-600" : index === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"}`}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="font-black text-blue-900 uppercase italic text-sm">{car.name}</p>
                        <p className={`text-[9px] font-bold uppercase mt-1 w-fit px-2 py-0.5 rounded-md ${car.owner === "Xe Hệ Thống" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>{car.owner}</p>
                      </td>
                      <td className="p-6 text-center"><span className="bg-indigo-50 text-indigo-600 font-black px-3 py-1 rounded-lg text-xs">{car.trips} chuyến</span></td>
                      <td className="p-6 text-right font-black italic text-emerald-600 text-lg tracking-tighter">{formatCurrency(car.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-blue-900 uppercase italic mb-6 border-b border-gray-50 pb-6">Top Địa Điểm (All Time)</h3>
            <ul className="space-y-6">
              {topLocations.map((loc) => (
                <li key={loc.id} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><MapPin size={18} /></div>
                    <div>
                      <p className="font-black text-gray-800 text-sm group-hover:text-blue-900 transition-colors">{loc.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{loc.trips} chuyến đi</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-xs font-black italic text-emerald-500">
                    <ArrowUpRight size={14}/> {loc.percent}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
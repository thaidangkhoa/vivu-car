/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Lấy tất cả chuyến đi hoàn thành kèm thông tin chi tiết xe và userId chủ xe
    const bookings = await prisma.booking.findMany({
      where: { status: "COMPLETED" },
      orderBy: { endDate: 'desc' }, //  Sắp xếp mới nhất lên đầu
      include: { 
        car: { 
          select: { 
            id: true, 
            name: true, 
            ownerType: true, 
            location: true,
            userId: true, // Dùng cái này để xác định đối tác
            licensePlate: true //  Thêm biển số để xuất file Excel
          } 
        },
        user: { //  Bắt buộc phải có để lấy tên và SĐT khách hàng cho file Excel
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    let totalGmv = 0;
    let profitSystem = 0;
    let profitPartner = 0;
    const monthlyMap = {};
    const carStatsMap = {};
    const locationStatsMap = {};

    bookings.forEach(b => {
      totalGmv += b.totalPrice;
      
      // LOGIC PHÂN LOẠI THÔNG MINH:
      const isPartnerCar = b.car.userId !== null;
      
      let sysProfit = 0;
      let partProfit = 0;
      
      if (!isPartnerCar) {
        // XE HỆ THỐNG: Sàn thu 100%
        sysProfit = b.totalPrice;
        partProfit = 0;
      } else {
        // XE ĐỐI TÁC: Sàn thu 15%, Đối tác 85%
        sysProfit = b.totalPrice * 0.15;
        partProfit = b.totalPrice * 0.85;
      }
      
      profitSystem += sysProfit;
      profitPartner += partProfit;

      // Gom theo tháng
      const date = new Date(b.createdAt);
      const monthKey = `T${date.getMonth() + 1}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { name: monthKey, gmv: 0, profitSystem: 0, profitPartner: 0, sortKey: date.getFullYear() * 12 + date.getMonth() };
      }
      monthlyMap[monthKey].gmv += b.totalPrice;
      monthlyMap[monthKey].profitSystem += sysProfit;
      monthlyMap[monthKey].profitPartner += partProfit;

      // Thống kê xe
      if (!carStatsMap[b.car.id]) {
        carStatsMap[b.car.id] = { 
          id: b.car.id, 
          name: b.car.name, 
          owner: isPartnerCar ? "Xe Đối Tác" : "Xe Hệ Thống", 
          trips: 0, 
          revenue: 0 
        };
      }
      carStatsMap[b.car.id].trips += 1;
      carStatsMap[b.car.id].revenue += b.totalPrice;

      // Thống kê địa điểm
      const locName = b.car.location || "Chưa xác định";
      if (!locationStatsMap[locName]) {
        locationStatsMap[locName] = { id: locName, name: locName, trips: 0 };
      }
      locationStatsMap[locName].trips += 1;
    });

    // 2. Lấy dữ liệu đánh giá
    const reviews = await prisma.review.findMany({
      include: { 
        user: { select: { name: true } }, 
        car: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalStars = 0;
    const ratingDistMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      totalStars += r.rating;
      ratingDistMap[r.rating] += 1;
    });

    const averageRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : "0.0";

    const finalData = {
      //  BỔ SUNG BIẾN NÀY ĐỂ FRONTEND LỌC ĐƯỢC NGÀY THÁNG
      rawBookings: bookings, 

      kpis: {
        totalGmv,
        profitSystem,
        profitPartner,
        totalTrips: bookings.length,
        averageRating,
        totalReviews: reviews.length
      },
      revenueData: Object.values(monthlyMap).sort((a, b) => a.sortKey - b.sortKey),
      pieChartData: [
        { name: "Lãi Xe Nhà (100%)", value: bookings.filter(b => b.car.userId === null).reduce((a, c) => a + c.totalPrice, 0) },
        { name: "Hoa hồng Đối Tác (15%)", value: bookings.filter(b => b.car.userId !== null).reduce((a, c) => a + (c.totalPrice * 0.15), 0) }
      ],
      topCars: Object.values(carStatsMap).sort((a, b) => b.trips - a.trips).slice(0, 5),
      topLocations: Object.values(locationStatsMap).sort((a, b) => b.trips - a.trips).slice(0, 5).map(l => ({ ...l, trend: 'up', percent: "Hot" })),
      ratingDistribution: [
        { stars: "5 Sao", count: ratingDistMap[5] },
        { stars: "4 Sao", count: ratingDistMap[4] },
        { stars: "3 Sao", count: ratingDistMap[3] },
        { stars: "2 Sao", count: ratingDistMap[2] },
        { stars: "1 Sao", count: ratingDistMap[1] },
      ],
      recentReviews: reviews.slice(0, 5).map(r => ({
        id: r.id,
        user: r.user?.name || "Khách hàng",
        car: r.car?.name,
        rating: r.rating,
        comment: r.comment || "Không có bình luận",
        time: new Date(r.createdAt).toLocaleDateString('vi-VN')
      }))
    };

    return NextResponse.json({ success: true, data: finalData });
  } catch (error) {
    console.error("Lỗi lấy báo cáo:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
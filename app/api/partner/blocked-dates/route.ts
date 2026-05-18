/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// LẤY DANH SÁCH LỊCH BẬN CỦA ĐỐI TÁC
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        car: { userId: Number(session.user.id) } // Chỉ lấy lịch của xe thuộc sở hữu đối tác này
      },
      include: { car: { select: { name: true, licensePlate: true } } },
      orderBy: { startDate: "asc" }
    });

    return NextResponse.json({ success: true, blockedDates });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// THÊM LỊCH BẬN MỚI
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    
    //  BẬT TÍNH NĂNG THEO DÕI: Xem dữ liệu frontend gửi lên có gì
    console.log("--- DỮ LIỆU MUỐN LƯU ---", body);

    const { carId, startDate, endDate, reason } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!carId || !startDate || !endDate) {
      return NextResponse.json({ error: "Thiếu thông tin khóa lịch" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json({ error: "Ngày bắt đầu không được lớn hơn ngày kết thúc" }, { status: 400 });
    }

    //  BƯỚC 1: BẢO MẬT - Kiểm tra xe này có đúng là của đối tác đang đăng nhập không
    const carBelongsToUser = await prisma.car.findFirst({
      where: { 
        id: Number(carId), 
        userId: Number(session.user.id) 
      }
    });

    if (!carBelongsToUser) {
      return NextResponse.json({ error: "Bạn không có quyền thao tác trên xe này!" }, { status: 403 });
    }

    //  BƯỚC 2: KIỂM TRA TRÙNG LỊCH VỚI KHÁCH HÀNG ĐÃ ĐẶT (BOOKINGS)
    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        carId: Number(carId),
        // Chỉ quét các đơn chưa bị hủy/chưa hoàn thành
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        // Logic tìm thời gian giao nhau
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ]
      }
    });

    if (overlappingBookings) {
      const bStart = new Date(overlappingBookings.startDate).toLocaleDateString('vi-VN');
      const bEnd = new Date(overlappingBookings.endDate).toLocaleDateString('vi-VN');
      return NextResponse.json({ 
        error: `Không thể khóa! Xe đã được khách đặt từ ${bStart} đến ${bEnd}.` 
      }, { status: 400 });
    }

    //  BƯỚC 3: KIỂM TRA TRÙNG LỚP VỚI CÁC LỊCH BẬN ĐÃ TẠO TRƯỚC ĐÓ
    const overlappingBlocks = await prisma.blockedDate.findFirst({
      where: {
        carId: Number(carId),
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ]
      }
    });

    if (overlappingBlocks) {
      return NextResponse.json({ error: "Khoảng thời gian này đã bị khóa từ trước!" }, { status: 400 });
    }

    //  BƯỚC 4: TẤT CẢ ĐỀU AN TOÀN -> CHO PHÉP TẠO LỊCH BẬN
    const newBlock = await prisma.blockedDate.create({
      data: {
        carId: Number(carId),
        startDate: start,
        endDate: end,
        reason: reason || "Chủ xe sử dụng"
      },
      include: { car: { select: { name: true, licensePlate: true } } }
    });

    return NextResponse.json({ success: true, block: newBlock });
  } catch (error: any) { 
    console.error("❌ LỖI LƯU LỊCH BẬN VÀO DATABASE:", error.message);
    return NextResponse.json({ error: "Lỗi lưu dữ liệu", details: error.message }, { status: 500 });
  }
}
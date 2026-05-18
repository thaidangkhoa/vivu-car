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

    // 1. Đếm đơn hàng đang TRANH CHẤP (Khẩn cấp đỏ)
    const disputedBookings = await prisma.booking.count({
      where: { status: "DISPUTED" }
    });

    // 2. Đếm xe đang chờ duyệt (Cam)
    const pendingCars = await prisma.car.count({
      where: { status: "PENDING" }
    });

    // 3. Đếm đơn đặt xe mới đang chờ cọc (Xanh dương)
    const pendingBookings = await prisma.booking.count({
      where: { status: "PENDING" }
    });

    //  4. HỦY XE NHƯNG CHƯA HOÀN TIỀN 
    // Logic: Đơn đã CANCELLED nhưng khách đã cọc (DEPOSITED) hoặc trả đủ (PAID_FULL)
    const pendingRefunds = await prisma.booking.count({
      where: { 
        status: "CANCELLED",
        paymentStatus: { in: ["DEPOSITED", "PAID_FULL"] } 
      }
    });

    //  5. YÊU CẦU RÚT TIỀN (Khớp với bảng Transaction của bạn)
    const pendingWithdrawals = await prisma.transaction.count({
      where: { 
        type: "PAYOUT", 
        status: "PENDING" 
      }
    });

    //  6. YÊU CẦU HỖ TRỢ (Khớp với bảng ContactMessage của bạn)
    const pendingContacts = await prisma.contactMessage.count({
      where: { status: "PENDING" } 
    });

    // Tổng hợp tất cả các thông báo
    const total = disputedBookings + pendingCars + pendingBookings + pendingRefunds + pendingWithdrawals + pendingContacts;

    return NextResponse.json({
      disputedBookings,
      pendingCars,
      pendingBookings,
      pendingRefunds,
      pendingWithdrawals,
      pendingContacts,
      total
    });
  } catch (error) {
    console.error("Lỗi đếm thông báo API:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}
/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookingId = Number(resolvedParams.id);

    if (!bookingId) {
      return NextResponse.json({ error: "ID đơn hàng không hợp lệ" }, { status: 400 });
    }

    //  SỬA LỖI 1: Lấy chi tiết đơn hàng KÈM THÔNG TIN XE VÀ NGƯỜI ĐẶT
    let booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          include: { user: true } // Kéo thông tin chủ xe
        },
        user: true // <--- BẮT BUỘC PHẢI CÓ ĐỂ BIẾT AI LÀ NGƯỜI ĐẶT XE
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    //  BẮT ĐẦU: CHIÊU THỨC LAZY UPDATE (HỦY ĐƠN QUÁ HẠN 20 PHÚT)
    if (booking.status === "PENDING") {
      const createdAtTime = new Date(booking.createdAt).getTime();
      const currentTime = Date.now();
      const EXPIRY_MINUTES = 20;

      if (currentTime - createdAtTime > EXPIRY_MINUTES * 60 * 1000) {
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CANCELLED" },
          include: { 
            car: { include: { user: true } },
            user: true
          }
        });
        booking = updatedBooking;
      }
    }
    //  KẾT THÚC LAZY UPDATE

    //  SỬA LỖI 2: Dùng userId để kiểm tra quyền thay vì userEmail
    const currentUserId = Number(session.user.id);
    const isRenter = booking.userId === currentUserId;
    const isOwner = booking.car?.userId === currentUserId;
    
    if (!isRenter && !isOwner && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Bạn không có quyền xem đơn hàng này" }, { status: 403 });
    }

    return NextResponse.json({ success: true, booking });

  } catch (error: any) {
    console.error("LỖI LẤY CHI TIẾT ĐƠN HÀNG:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}
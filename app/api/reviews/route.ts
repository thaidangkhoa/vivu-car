/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đánh giá" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, carId, rating, comment } = body;

    // Validate dữ liệu
    if (!bookingId || !carId || !rating) {
      return NextResponse.json({ error: "Thiếu thông tin đánh giá" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Số sao phải từ 1 đến 5" }, { status: 400 });
    }

    // Tìm ID của user đang đăng nhập
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Kiểm tra xem chuyến đi này đã được đánh giá chưa (Chống spam)
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: Number(bookingId) }
    });

    if (existingReview) {
      return NextResponse.json({ error: "Bạn đã đánh giá chuyến đi này rồi!" }, { status: 400 });
    }

    // Kiểm tra xem chuyến đi có đúng là của user này và đã HOÀN THÀNH chưa
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) }
    });

    if (!booking || booking.userId !== user.id) {
       return NextResponse.json({ error: "Đơn hàng không hợp lệ" }, { status: 403 });
    }

    if (booking.status !== "COMPLETED") {
       return NextResponse.json({ error: "Chỉ có thể đánh giá chuyến đi đã hoàn thành" }, { status: 400 });
    }

    //  Tạo đánh giá lưu vào Database
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment || "",
        userId: user.id,
        carId: Number(carId),
        bookingId: Number(bookingId)
      }
    });

    return NextResponse.json({ success: true, review: newReview, message: "Cảm ơn bạn đã đánh giá!" });

  } catch (error: any) {
    console.error("LỖI TẠO ĐÁNH GIÁ:", error);
    return NextResponse.json({ error: "Lỗi Server cục bộ" }, { status: 500 });
  }
}
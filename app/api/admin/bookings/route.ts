/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendBookingEmail } from "@/lib/mail";

export async function GET() {
  try {
    //  DỌN RÁC TRƯỚC KHI LẤY DỮ LIỆU RA CHO ADMIN XEM
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: twentyMinutesAgo }
      },
      data: {
        status: "CANCELLED",
        note: "Hệ thống tự động hủy do quá hạn thanh toán 20 phút."
      }
    });
    const bookings = await prisma.booking.findMany({
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            //  KHÔNG lấy password ở đây để bảo mật
          }
        }, 
        car: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Kiểm tra log để xem depositAmount có thật hay không
    // console.log("Dữ liệu đơn hàng đầu tiên:", bookings[0]);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Lỗi GET Admin Bookings:", error);
    return NextResponse.json({ error: "Lỗi lấy dữ liệu" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    // 1. KIỂM TRA BẢO MẬT TRƯỚC KHI DUYỆT (CHỐNG TRÙNG LỊCH)
    if (status === "CONFIRMED") {
      const currentBooking = await prisma.booking.findUnique({
        where: { id: Number(id) }
      });

      if (!currentBooking) {
        return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
      }

      const overlappingBooking = await prisma.booking.findFirst({
        where: {
          carId: currentBooking.carId,
          status: "CONFIRMED",
          id: { not: Number(id) },
          AND: [
            { startDate: { lt: currentBooking.endDate } },
            { endDate: { gt: currentBooking.startDate } },
          ],
        },
      });

      if (overlappingBooking) {
        return NextResponse.json(
          { error: "Xe này đã được duyệt cho khách khác trong khung giờ này!" }, 
          { status: 400 }
        );
      }
    }

    // 2. CẬP NHẬT DATABASE
    // Đảm bảo lấy đủ depositAmount và totalPrice sau khi update
    const updated = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: status },
      include: { 
        user: true,
        car: true
      } 
    });

    // 3. GỬI MAIL THÔNG BÁO
    if (updated.user?.email) {
      // Khoa có thể truyền thêm tiền cọc vào hàm mail nếu file mail.ts có hỗ trợ
      sendBookingEmail(
        updated.user.email,
        updated.customerName || updated.user.name || "Khách hàng",
        updated.car.name,
        status
      );
      console.log(`>>> Đã gửi thông báo tới: ${updated.user.email}`);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Lỗi PATCH Admin:", error);
    return NextResponse.json({ error: "Lỗi cập nhật hệ thống" }, { status: 500 });
  }
}
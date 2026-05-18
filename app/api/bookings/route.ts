/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/lib/auth"; 

// ==========================================
// 1. API GET: LẤY DANH SÁCH ĐƠN HÀNG (CHO ADMIN)
// ==========================================
export async function GET() {
  try {
    const cleanupTimeLimit = new Date(Date.now() - 20 * 60 * 1000);
    
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: cleanupTimeLimit } 
      },
      data: {
        status: "CANCELLED",
        note: "Hệ thống tự động hủy do quá hạn thanh toán 20 phút."
      }
    });

    const bookings = await prisma.booking.findMany({
      include: { 
        user: { select: { id: true, name: true, email: true, phone: true } }, 
        car: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Lỗi GET Admin Bookings:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lấy dữ liệu" }, { status: 500 });
  }
}

// ==========================================
// 2. API POST: KHÁCH HÀNG ĐẶT XE MỚI
// ==========================================
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "BẠN CẦN ĐĂNG NHẬP ĐỂ THỰC HIỆN ĐẶT XE!" }, { status: 401 });
    }

    const userId = session.user.id;
    const bookingTimeLimit = new Date(Date.now() - 20 * 60 * 1000);

    // BƯỚC 1: QUÉT RÁC TỰ ĐỘNG
    await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: bookingTimeLimit } 
      },
      data: {
        status: "CANCELLED",
        note: "Hệ thống tự động hủy do quá hạn thanh toán 20 phút."
      }
    });

    // BƯỚC 2: CHỐNG ĐẦU CƠ
    const pendingBooking = await prisma.booking.findFirst({
      where: { userId: Number(userId), status: "PENDING" }
    });

    if (pendingBooking) {
      return NextResponse.json(
        { error: "BẠN ĐANG CÓ MỘT ĐƠN ĐẶT XE CHƯA HOÀN TẤT THANH TOÁN. VUI LÒNG THANH TOÁN HOẶC HỦY ĐƠN CŨ ĐỂ TIẾP TỤC!" },
        { status: 400 }
      );
    }

    // BƯỚC 3: LẤY VÀ KIỂM TRA DỮ LIỆU ĐẦU VÀO
    const body = await request.json();
    const { carId, startDate, endDate, totalPrice, customerNote, promoCode, customerName, customerPhone, isDelivery, deliveryAddress, deliveryFee, paymentMethod } = body;

    if (!carId || !startDate || !endDate) {
      return NextResponse.json({ error: "VUI LÒNG CHỌN ĐẦY ĐỦ LỊCH TRÌNH!" }, { status: 400 });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);
    const now = new Date();

    if (requestedStart < now) {
      return NextResponse.json({ error: "NGÀY NHẬN XE KHÔNG ĐƯỢC Ở QUÁ KHỨ!" }, { status: 400 });
    }
    if (requestedStart >= requestedEnd) {
      return NextResponse.json({ error: "NGÀY TRẢ XE PHẢI SAU NGÀY NHẬN XE!" }, { status: 400 });
    }

    // ===============================================================
    //  BƯỚC 4: LOGIC CHỐNG TRÙNG LỊCH BẰNG JAVASCRIPT (ĐỘ CHÍNH XÁC 100%)
    // Triệt tiêu hoàn toàn lỗi lệch múi giờ UTC của Database
    // ===============================================================
    
    // Kéo TẤT CẢ các đơn hàng đang có hiệu lực của chiếc xe này về
    const activeBookings = await prisma.booking.findMany({
      where: {
        carId: Number(carId),
        status: { 
          in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] 
        }
      }
    });

    const reqStartMs = requestedStart.getTime();
    const reqEndMs = requestedEnd.getTime();
    const limitMs = bookingTimeLimit.getTime();

    // Dùng Javascript để quét qua từng đơn và check TimeStamp
    const isConflict = activeBookings.some(booking => {
      // 1. Bỏ qua các đơn PENDING đã quá hạn 20 phút (hệ thống chưa kịp dọn rác)
      if (booking.status === "PENDING" && new Date(booking.createdAt).getTime() < limitMs) {
        return false; 
      }

      // 2. Chuyển đổi ngày mượn xe trong DB ra mốc Mili-giây (Timestamp tuyệt đối)
      const existStartMs = new Date(booking.startDate).getTime();
      const existEndMs = new Date(booking.endDate).getTime();

      // 3. Công thức giao thoa toán học: A.start < B.end VÀ A.end > B.start
      return existStartMs < reqEndMs && existEndMs > reqStartMs;
    });

    if (isConflict) {
      return NextResponse.json(
        { error: "XIN LỖI! XE NÀY ĐANG LĂN BÁNH HOẶC ĐÃ CÓ NGƯỜI ĐẶT. VUI LÒNG CHỌN LỊCH KHÁC!" }, 
        { status: 400 }
      );
    }

    // ===============================================================
    //  BƯỚC 5: LƯỚI BẢO VỆ LỊCH KHÓA CỦA CHỦ XE (Cũng dùng JS)
    // ===============================================================
    const activeBlocks = await prisma.blockedDate.findMany({
      where: { carId: Number(carId) }
    });

    const overlappingBlock = activeBlocks.find(block => {
      const blockStartMs = new Date(block.startDate).getTime();
      const blockEndMs = new Date(block.endDate).getTime();
      return blockStartMs < reqEndMs && blockEndMs > reqStartMs;
    });

    if (overlappingBlock) {
      const formattedStart = new Date(overlappingBlock.startDate).toLocaleDateString('vi-VN');
      const formattedEnd = new Date(overlappingBlock.endDate).toLocaleDateString('vi-VN');
      return NextResponse.json({ error: `XIN LỖI, XE ĐÃ BỊ CHỦ XE KHÓA LỊCH TỪ NGÀY ${formattedStart} ĐẾN ${formattedEnd}.` }, { status: 400 });
    }

    // BƯỚC 6: TÍNH TIỀN VÀ TẠO ĐƠN
    const calculatedDeposit = paymentMethod === "FULL_PAY" ? Number(totalPrice) : Math.round(Number(totalPrice) * 0.3);

    const newBooking = await prisma.booking.create({
      data: {
        startDate: requestedStart, 
        endDate: requestedEnd,
        totalPrice: Number(totalPrice),
        depositAmount: calculatedDeposit, 
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        status: "PENDING", 
        paymentStatus: paymentMethod === "FULL_PAY" ? "PAID_FULL" : "DEPOSITED",
        paymentMethod: paymentMethod || "DEPOSIT",
        note: customerNote || "",
        promoCode: promoCode || null,
        isDelivery: isDelivery || false,
        deliveryAddress: deliveryAddress || null,
        deliveryFee: Number(deliveryFee || 0),
        car: { connect: { id: Number(carId) } },
        user: { connect: { id: Number(userId) } }
      }
    });

    return NextResponse.json({ message: "ĐẶT XE THÀNH CÔNG!", booking: newBooking }, { status: 201 });

  } catch (error) {
    console.error("LỖI API BOOKINGS:", error);
    return NextResponse.json({ error: "LỖI HỆ THỐNG KHI XỬ LÝ ĐƠN HÀNG", details: error.message }, { status: 500 });
  }
}
/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Không có quyền truy cập!" }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    const currentUserId = parseInt(session.user.id);

    // 1. Kéo thông tin đơn hàng, xe và chủ xe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        car: true 
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng!" }, { status: 404 });
    }

    // 2. Kiểm tra quyền (Chỉ Chủ xe hoặc Admin mới được bấm nút này)
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = booking.car.userId === currentUserId;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Bạn không có quyền thao tác trên đơn hàng này!" }, { status: 403 });
    }

    // 3. Chỉ cho phép báo "No-show" khi xe đang ở trạng thái CONFIRMED (Đã xác nhận / Đợi giao)
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Chỉ có thể báo vắng mặt với đơn hàng Đã xác nhận chờ lấy xe!" }, { status: 400 });
    }

    // 4. Tìm Ví của chủ xe (Dựa vào userId của chủ xe)
    const ownerWallet = await prisma.wallet.findUnique({
      where: { userId: booking.car.userId }
    });

    if (!ownerWallet) {
      return NextResponse.json({ error: "Chủ xe chưa thiết lập Ví để nhận tiền đền bù!" }, { status: 400 });
    }

    // 5. BÀI TOÁN CHIA TIỀN
    const depositAmt = booking.depositAmount || 0; // Tiền khách đã cọc
    const platformFeePercent = booking.car.commission || 20; // Hoa hồng web (Mặc định 20%)
    
    // Tiền chủ xe thực nhận = Tiền cọc - Phí nền tảng
    const ownerCompensation = Math.round(depositAmt * (1 - platformFeePercent / 100));

    // ===============================================================
    //  BƯỚC 6: GIAO DỊCH ĐỒNG THỜI (TRANSACTION)
    // Thực hiện 3 hành động cùng 1 lúc, lỗi 1 cái là rollback (hoàn tác) toàn bộ
    // ===============================================================
    await prisma.$transaction([
      // Hành động 1: Hủy cuốc xe và ghi rõ lý do
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelReason: "Khách hàng không đến nhận xe đúng hẹn. Hệ thống thu cọc theo chính sách.",
          paymentStatus: "DEPOSITED" // Giữ nguyên trạng thái tiền là đã thu cọc
        }
      }),

      // Hành động 2: Bơm tiền đền bù vào ví của Chủ xe
      prisma.wallet.update({
        where: { id: ownerWallet.id },
        data: { balance: { increment: ownerCompensation } }
      }),

      // Hành động 3: In biên lai (Lịch sử giao dịch) cho Chủ xe thấy
      prisma.transaction.create({
        data: {
          walletId: ownerWallet.id,
          bookingId: bookingId,
          amount: ownerCompensation,
          type: "EARNING",
          status: "COMPLETED",
          description: `Đền bù No-show (Khách không nhận xe) - Mã đơn #${bookingId}`
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Đã hủy đơn và chuyển tiền bồi thường vào ví của bạn!",
      compensation: ownerCompensation
    });

  } catch (error) {
    console.error("Lỗi xử lý No-show:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xử lý báo vắng mặt!" }, { status: 500 });
  }
}
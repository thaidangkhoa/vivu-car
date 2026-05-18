/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Chỉ Admin mới có quyền thực hiện!" }, { status: 403 });
    }

    const resolvedParams = await params;
    const bookingId = Number(resolvedParams.id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: { include: { user: true } } } 
    });

    if (!booking) return NextResponse.json({ error: "Không tìm thấy chuyến đi" }, { status: 404 });
    if (booking.status === "COMPLETED") {
      return NextResponse.json({ error: "Chuyến đi này đã được chốt tiền rồi!" }, { status: 400 });
    }

    if (booking.status !== "RETURNED") {
      return NextResponse.json({ 
        error: "Chưa thể chốt tiền! Phải xác nhận 'Đã nhận lại xe' trước." 
      }, { status: 400 });
    }

    //  KIỂM TRA PHÂN LOẠI XE (HỆ THỐNG HAY ĐỐI TÁC)
    const isCompanyCar = booking.car?.ownerType === "COMPANY" || !booking.car?.userId;

    await prisma.$transaction(async (tx) => {
      
      // A. LÚC NÀO CŨNG PHẢI ĐỔI TRẠNG THÁI ĐƠN HÀNG THÀNH HOÀN THÀNH
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED", paymentStatus: "PAID_FULL" }
      });

      // B. NẾU LÀ XE ĐỐI TÁC THÌ MỚI CHIA TIỀN VÀO VÍ
      if (!isCompanyCar) {
        const partnerId = booking.car.userId;
        const totalRevenue = booking.totalPrice; 
        const platformFee = totalRevenue * 0.15; // Sàn thu 15%
        const partnerEarning = totalRevenue - platformFee; // Đối tác nhận 85%

        const partnerPhone = booking.car.user?.phone || booking.car.ownerPhone || `NO_PHONE_${partnerId}`;
        const partnerName = booking.car.user?.name || booking.car.ownerName || "Đối tác ViVuCar";

        let partnerWallet = await tx.wallet.findFirst({
          where: { OR: [ { userId: partnerId }, { ownerPhone: partnerPhone } ] }
        });

        if (partnerWallet) {
          partnerWallet = await tx.wallet.update({
            where: { id: partnerWallet.id },
            data: { 
              balance: { increment: partnerEarning },
              ...( !partnerWallet.userId && { userId: partnerId } )
            }
          });
        } else {
          partnerWallet = await tx.wallet.create({
            data: {
              userId: partnerId,
              balance: partnerEarning,
              ownerName: partnerName,
              ownerPhone: partnerPhone
            }
          });
        }

        await tx.transaction.create({
          data: {
            walletId: partnerWallet.id,
            type: "EARNING",
            amount: partnerEarning,
            description: `Thu nhập chuyến #${booking.id} - Xe ${booking.car.licensePlate || "Chưa cập nhật"} (Đã trừ 15% phí nền tảng)`,
            status: "COMPLETED",
            bookingId: bookingId 
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: "Đã chốt chuyến thành công!" });

  } catch (error: any) {
    console.error("❌ LỖI CHỐT ĐƠN:", error.message);
    return NextResponse.json({ error: "Lỗi hệ thống khi chốt đơn!" }, { status: 500 });
  }
}
/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);

    // Tìm ví của User, nếu chưa có thì tự động tạo mới ví với 0đ
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" }, // Lấy giao dịch mới nhất lên đầu
          take: 20 // Lấy 20 giao dịch gần nhất
        }
      }
    });

    // ĐOẠN CODE MỚI ĐÃ SỬA LỖI
if (!wallet) {
  // 1. Tìm thông tin của User hiện tại trước để lấy tên và SĐT
  const currentUser = await prisma.user.findUnique({
    where: { id: Number(userId) }
  });

  // 2. Tạo ví mới và truyền đầy đủ dữ liệu bắt buộc
  wallet = await prisma.wallet.create({
    data: {
      userId: Number(userId),
      balance: 0,
      // Bổ sung ownerName và ownerPhone, nếu User chưa cập nhật thì để chuỗi mặc định
      ownerName: currentUser?.name || "Chưa cập nhật tên", 
      ownerPhone: currentUser?.phone || `NO_PHONE_${userId}`, 
    },
    include: {
      transactions: true
    }
  });
}

    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error("Lỗi tải Ví:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const withdrawAmount = Number(body.amount);
    const userId = Number(session.user.id);

    if (isNaN(withdrawAmount) || withdrawAmount < 500000) {
      return NextResponse.json({ error: "Số tiền rút tối thiểu là 500.000đ" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet || wallet.balance < withdrawAmount) {
      return NextResponse.json({ error: "Số dư không đủ để thực hiện giao dịch" }, { status: 400 });
    }

    // Thực hiện 2 hành động cùng lúc: Trừ tiền ví + Tạo lịch sử (Transaction)
    const [updatedWallet, newTransaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: withdrawAmount } } //  Trừ tiền ngay lập tức
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "PAYOUT",
          amount: -withdrawAmount,
          description: "Yêu cầu rút tiền về tài khoản ngân hàng",
          status: "PENDING" // Chờ Admin duyệt chuyển khoản
        }
      })
    ]);

    return NextResponse.json({ success: true, wallet: updatedWallet, transaction: newTransaction });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xử lý rút tiền" }, { status: 500 });
  }
}
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    //  SỬA Ở ĐÂY: Dùng đúng tên cột trong Database của bạn
    const { bankName, bankAccount, bankOwnerName } = body; 
    const userId = Number(session.user.id);

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { bankName, bankAccount, bankOwnerName }
    });

    return NextResponse.json({ success: true, wallet: updatedWallet });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật ngân hàng" }, { status: 500 });
  }
}
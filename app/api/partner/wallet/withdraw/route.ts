import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletId, amount } = body;

    if (!walletId || !amount || amount < 500000) {
      return NextResponse.json({ error: "Số tiền rút tối thiểu là 500,000đ" }, { status: 400 });
    }

    //  Bọc Transaction để trừ tiền và ghi log cùng lúc
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Kiểm tra số dư hiện tại (Lock row để tránh rút double)
        const wallet = await tx.wallet.findUnique({ where: { id: parseInt(walletId) } });
      
      if (!wallet || wallet.balance < amount) {
        throw new Error("INSUFFICIENT_FUNDS"); // Ném lỗi để hủy transaction
      }

      // 2. Trừ tiền khỏi ví
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - amount }
      });

      // 3. Tạo lịch sử giao dịch (Đang chờ xử lý)
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount, // Lưu số âm vì là rút ra
          type: "PAYOUT",
          status: "PENDING", // Kế toán/Admin chuyển khoản xong mới update thành COMPLETED
          description: "Yêu cầu rút tiền về tài khoản ngân hàng",
        }
      });

      return { updatedWallet, transaction };
    });

    return NextResponse.json({ success: true, transaction: result.transaction });
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json({ error: "Số dư ví không đủ" }, { status: 400 });
    }
    console.error("Lỗi rút tiền:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xử lý rút tiền" }, { status: 500 });
  }
}
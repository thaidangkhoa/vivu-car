/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
    }

    const resolvedParams = await params;
    //  SỬA TẠI ĐÂY: Giữ nguyên dạng chuỗi (String), KHÔNG dùng Number()
    const blockId = resolvedParams.id; 

    if (!blockId) {
      return NextResponse.json({ error: "ID lịch bận không hợp lệ" }, { status: 400 });
    }

    await prisma.blockedDate.delete({
      where: { id: blockId } // Tìm và xóa bằng chuỗi
    });

    return NextResponse.json({ success: true, message: "Mở khóa lịch thành công" });

  } catch (error: any) {
    console.error("❌ LỖI XÓA LỊCH BẬN:", error.message);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Lịch bận này không tồn tại hoặc đã bị xóa" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa lịch" }, { status: 500 });
  }
}
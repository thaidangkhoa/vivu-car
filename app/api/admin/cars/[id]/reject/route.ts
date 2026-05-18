/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    // 1. Kiểm tra quyền Admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền!" }, { status: 403 });
    }

    // 2. Lấy dữ liệu từ Request và Params
    const { reason } = await request.json();
    const { id } = await context.params; //  Xử lý async params
    const carId = Number(id);

    if (isNaN(carId)) {
      return NextResponse.json({ error: "ID xe không hợp lệ" }, { status: 400 });
    }

    // 3. Cập nhật Database
    await prisma.car.update({
      where: { id: carId },
      data: { 
        status: "REJECTED",
        // Lưu lý do vào cột rules (hoặc cột nào bạn đang dùng để hiển thị lý do lỗi cho đối tác)
        rules: reason || "Hồ sơ không đạt yêu cầu" 
      },
    });

    return NextResponse.json({ success: true, message: "Đã từ chối hồ sơ xe!" });
  } catch (error) {
    console.error("LỖI API REJECT:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi từ chối xe" }, { status: 500 });
  }
}
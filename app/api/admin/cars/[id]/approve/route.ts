/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

//  HÀM POST XỬ LÝ DUYỆT
export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    // 1. Kiểm tra quyền Admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền thực hiện hành động này!" }, { status: 403 });
    }

    // 2. Lấy carId từ URL (Xử lý chờ params nếu cần)
    const { id } = await context.params; 
    const carId = Number(id);

    if (isNaN(carId)) {
      return NextResponse.json({ error: "Mã số xe không hợp lệ!" }, { status: 400 });
    }

    console.log("--- ĐANG DUYỆT XE ---");
    console.log("Car ID:", carId);

    // 3. Cập nhật trạng thái xe
    // Chúng ta bọc trong một khối try-catch nhỏ để biết chính xác lỗi tại Database
    try {
      const updatedCar = await prisma.car.update({
        where: { id: carId },
        data: { 
          status: "APPROVED",
          isDepositPaid: true
          
          
        },
      });

      console.log("✅ DUYỆT THÀNH CÔNG:", updatedCar.name);

      return NextResponse.json({ 
        success: true, 
        message: "Đã duyệt xe thành công!" 
      });

    } catch (prismaError) {
      console.error("❌ LỖI TẠI PRISMA KHI UPDATE:", prismaError.message);
      return NextResponse.json({ 
        error: "Database không tìm thấy xe hoặc bị lỗi cấu trúc", 
        details: prismaError.message 
      }, { status: 404 });
    }

  } catch (error) {
    console.error("❌ LỖI HỆ THỐNG API APPROVE:", error);
    return NextResponse.json({ 
      error: "Lỗi hệ thống khi xử lý duyệt xe", 
      details: error.message 
    }, { status: 500 });
  }
}
/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    //  ĐÃ SỬA: Chỉ cần kiểm tra người dùng đã đăng nhập chưa
    if (!session || !session.user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }

    const resolvedParams = await params;
    const carId = Number(resolvedParams.id);
    const body = await request.json();
    const { status } = body; 

    if (!carId || !status) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    //  CHỐT CHẶN BẢO MẬT THÔNG MINH (OWNERSHIP)
    let existingCar;
    if (session.user.role === "ADMIN") {
      // Admin thì quyền lực tối cao, xử lý được mọi xe
      existingCar = await prisma.car.findUnique({ where: { id: carId } });
    } else {
      // Dù là USER hay PARTNER: Hệ thống chỉ cho phép thao tác nếu ID tài khoản khớp với ID chủ xe
      existingCar = await prisma.car.findFirst({
        where: { id: carId, userId: Number(session.user.id) }
      });
    }

    if (!existingCar) {
      return NextResponse.json({ error: "Hệ thống từ chối: Bạn không có quyền thao tác trên phương tiện này!" }, { status: 403 });
    }

    // Tiến hành cập nhật trạng thái
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: { status: status }
    });

    return NextResponse.json({ success: true, car: updatedCar });

  } catch (error: any) {
    console.error("❌ Lỗi cập nhật trạng thái xe:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật trạng thái" }, { status: 500 });
  }
}
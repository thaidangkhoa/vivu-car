/* app/api/admin/promotions/[id]/route.ts */
/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. CẬP NHẬT THÔNG TIN MÃ
export async function PATCH(request, { params }) {
  try {
    //  BƯỚC 1: BẮT BUỘC PHẢI AWAIT PARAMS Ở NEXT.JS 15
    const resolvedParams = await params; 
    const id = Number(resolvedParams.id);

    // Bước 2: Lấy dữ liệu mới từ Frontend gửi lên
    const body = await request.json();

    // Bước 3: Cập nhật vào Database
    const updatedPromo = await prisma.promotion.update({
      where: { id: id },
      data: {
        title: body.title,
        code: body.code,
        discount: body.discount, // Chỉnh sửa giá tiền ở đây
        type: body.type,
        description: body.description,
        isActive: body.isActive,
        expiryDate: body.expiryDate,
        // ... (cập nhật các trường dữ liệu mà bạn muốn sửa)
      },
    });

    return NextResponse.json({ message: "Cập nhật thành công!", promo: updatedPromo });
  } catch (error) {
    console.error("Lỗi cập nhật mã:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật" }, { status: 500 });
  }
}

// 2. XÓA MÃ ƯU ĐÃI
export async function DELETE(request, { params }) {
  try {
    
    const resolvedParams = await params; 
    const id = Number(resolvedParams.id);

    await prisma.promotion.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Xóa thành công!" });
  } catch (error) {
    console.error("Lỗi xóa mã:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa" }, { status: 500 });
  }
}
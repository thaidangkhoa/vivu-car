/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập!" }, { status: 403 });
    }

    const cars = await prisma.car.findMany({
      where: { status: "PENDING" },
      include: {
        //  Lấy thêm thông tin user từ mối quan hệ chúng ta vừa tạo ở Schema
        user: {
          select: { name: true, phone: true, email: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, cars });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    //  Lấy đúng biến licensePlate mà Frontend gửi lên
    const { licensePlate } = await request.json();

    if (!licensePlate) {
      return NextResponse.json({ exists: false });
    }

    // Tìm trong Database xem biển số này đã tồn tại chưa
    const existingCar = await prisma.car.findFirst({
      where: { licensePlate: licensePlate },
    });

    // Trả về true nếu có xe trùng, false nếu chưa có
    return NextResponse.json({ exists: !!existingCar });
    
  } catch (error) {
    console.error("Lỗi API Check Unique:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
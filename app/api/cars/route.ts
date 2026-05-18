/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  try {
    const cars = await prisma.car.findMany({
      where: {
        status: "APPROVED",
        ...(location && {
          location: { contains: location }
        })
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(cars);
  } catch (error) {
    console.error("Lỗi tải danh sách xe:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    //  BƯỚC 1: KIỂM TRA TRÙNG LẶP BIỂN SỐ XE (LỚP PHÒNG THỦ 2)
    if (body.licensePlate) {
      const existingCar = await prisma.car.findUnique({
        where: {
          licensePlate: body.licensePlate,
        },
      });

      // Nếu đã có xe mang biển số này -> Chặn lại ngay và trả lỗi về Frontend
      if (existingCar) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Biển số xe này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!" 
          }, 
          { status: 400 }
        );
      }
    }

    //  BƯỚC 2: Tách bỏ 'images' (nếu có) để tránh lỗi Prisma ValidationError
    const { images, ...rest } = body;

    //  BƯỚC 3: Xử lý dữ liệu linh hoạt (Dù Frontend gửi Mảng hay Chuỗi đều chạy được)
    const carData = {
      ...rest,
      priceOriginal: Number(body.priceOriginal || 0),
      priceDiscount: Number(body.priceDiscount || body.priceOriginal || 0),
      seats: Number(body.seats || 4),
      deliveryFee: Number(body.deliveryFee || 0),

      // Xử lý tiện nghi: Nếu là mảng thì giữ, nếu là chuỗi thì cắt
      amenities: Array.isArray(body.amenities) 
        ? body.amenities 
        : (body.amenities ? body.amenities.split(',').map(i => i.trim()).filter(Boolean) : []),

      // Xử lý thư viện ảnh: Nếu là mảng thì giữ, nếu là chuỗi thì cắt
      gallery: Array.isArray(body.gallery) 
        ? body.gallery 
        : (body.gallery ? body.gallery.split(',').map(i => i.trim()).filter(Boolean) : []),
      
      status: body.status || "APPROVED"
    };

    //  BƯỚC 4: Đưa vào Database
    const newCar = await prisma.car.create({
      data: carData,
    });

    return NextResponse.json({ success: true, data: newCar }, { status: 201 });
  } catch (error: any) {
    console.error("❌ LỖI TẠO XE MỚI:", error.message);
    return NextResponse.json({ 
      error: "Lỗi hệ thống khi thêm xe!", 
      details: error.message 
    }, { status: 500 });
  }
}
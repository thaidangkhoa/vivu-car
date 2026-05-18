/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Phiên đăng nhập hết hạn!" }, { status: 401 });
    }

    const body = await request.json();
    const currentUserId = Number(session.user.id);

    // 🔍 Kiểm tra log để chắc chắn ID chuẩn
    console.log("ĐANG TẠO XE CHO USER ID:", currentUserId);

    // Kiểm tra bắt buộc phải có Cà vẹt và Đăng kiểm (Bảo vệ thêm 1 lớp ở Backend)
    if (!body.registrationPaper || !body.inspectionCertificate) {
      return NextResponse.json({ error: "Hệ thống từ chối: Thiếu Giấy đăng ký xe hoặc Đăng kiểm!" }, { status: 400 });
    }
//  LƯỚI LỌC: Kiểm tra biển số xe đã tồn tại chưa
if (body.licensePlate) {
  const existingCar = await prisma.car.findUnique({
    where: { licensePlate: body.licensePlate }
  });
  
  if (existingCar) {
    return NextResponse.json(
      { error: `Biển số xe ${body.licensePlate} đã được đăng ký trên hệ thống!` }, 
      { status: 400 }
    );
  }
}
    try {
      const newCar = await prisma.car.create({
        data: {
          name: body.name,
          brand: body.brand,
          category: body.category || "Sedan",
          tier: body.tier || "Standard",
          transmission: body.transmission || "Automatic",
          fuel: body.fuel || "Gasoline",
          seats: Number(body.seats) || 5,
          priceOriginal: Number(body.priceOriginal) || 0,
          
          // Lấy đúng giá khuyến mãi, nếu không có thì lấy giá gốc
          priceDiscount: Number(body.priceDiscount) || Number(body.priceOriginal) || 0,
          
          image: body.image,
          gallery: body.gallery || [],
          address: body.address || "",
          location: body.location || "HaNoi",
          requirements: body.requirements || "",
          rules: body.rules || "",
          status: "PENDING",
          
          licensePlate: body.licensePlate || "",
          ownerCCCD: body.ownerCCCD || "",
          deliveryFee: Number(body.deliveryFee) || 0,
          amenities: body.amenities || [],

          // 1. MÔ TẢ
          description: body.description || "",

          // ==========================================
          //  2. ĐÃ BỔ SUNG LƯU GIẤY TỜ VÀO DATABASE
          // ==========================================
          registrationPaper: body.registrationPaper,
          inspectionCertificate: body.inspectionCertificate,
          insurancePaper: body.insurancePaper || null,

          // 3. ĐÁNH DẤU RÕ ĐÂY LÀ XE CỦA ĐỐI TÁC
          ownerType: "PARTNER",
          
          user: {
            connect: { id: currentUserId }
          }
        }
      });

      return NextResponse.json({ success: true, car: newCar });
    } catch (prismaError) {
      console.error("❌ LỖI PRISMA CHI TIẾT:", prismaError.message);
      return NextResponse.json({ 
        error: "Lỗi cấu trúc dữ liệu Database", 
        details: prismaError.message 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ LỖI HỆ THỐNG API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Không được phép truy cập" }, { status: 401 });
    }

    const cars = await prisma.car.findMany({
      where: {
        userId: Number(session.user.id) 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, cars });
  } catch (error) {
    console.error("LỖI TẢI DANH SÁCH XE:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách xe" }, { status: 500 });
  }
}
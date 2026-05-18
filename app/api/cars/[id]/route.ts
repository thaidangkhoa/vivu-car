/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 

// ==========================================
// 1. HÀM GET: Lấy thông tin xe (Đã vá lỗ hổng chặn lịch)
// ==========================================
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Khởi tạo mốc thời gian: 20 phút trước 
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000); 

    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
      include: { 
        //  ĐÃ VÁ LỖI TẠI ĐÂY: Kéo cả những đơn đang IN_PROGRESS xuống giao diện
        bookings: {
          where: { 
            OR: [
              { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
              { status: "PENDING", createdAt: { gte: twentyMinutesAgo } }
            ]
          }
        },
        // Kéo danh sách lịch bận của chủ xe ra
        blockedDates: true,
        
        // Kéo toàn bộ đánh giá của xe này kèm tên User
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: {
            createdAt: 'desc' 
          }
        }
      },
    });

    if (!car) return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });

    // BỨC TƯỜNG BẢO VỆ THÔNG MINH
    if (car.status !== "APPROVED") {
      const session = await getServerSession(authOptions);
      
      const isAdmin = session?.user?.role === "ADMIN";
      const isOwner = session?.user?.id && car.userId === Number(session.user.id);

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: "Xe này hiện không khả dụng để thuê!" }, { status: 403 });
      }
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error("Lỗi GET chi tiết xe:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// ==========================================
// 2. HÀM DELETE: Xóa xe khỏi hệ thống (Chỉ Admin hoặc Chủ xe)
// ==========================================
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Không có quyền thực hiện" }, { status: 401 });
    }

    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = car.userId === Number(session.user.id);
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Bạn không có quyền xóa xe này!" }, { status: 403 });
    }

    await prisma.car.delete({
      where: { id: carId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Không thể xóa! Xe này đã có lịch sử thuê, hãy giữ lại để đối soát doanh thu." }, 
        { status: 400 }
      );
    }
    console.error("Lỗi xóa xe:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa xe" }, { status: 500 });
  }
}

// ==========================================
// 3. HÀM PUT: Cập nhật thông tin xe (Chỉ Admin hoặc Chủ xe)
// ==========================================
// ==========================================
// 3. HÀM PUT: Cập nhật thông tin xe 
// ==========================================
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Không có quyền thực hiện" }, { status: 401 });
    }

    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);
    
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = car.userId === Number(session.user.id);
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Bạn không có quyền cập nhật xe này!" }, { status: 403 });
    }

    const body = await request.json();

    //  ĐÃ SỬA TẠI ĐÂY: Chặn đứng wallet và walletId không cho chui vào Prisma
    const { 
      id, createdAt, updatedAt, bookings, user, userId, 
      blockedDates, reviews, wallet, walletId, 
      ...restBody 
    } = body;

    const updateData = {
      ...restBody,
      priceOriginal: Number(restBody.priceOriginal) || 0,
      priceDiscount: Number(restBody.priceDiscount) || 0,
      seats: Number(restBody.seats) || 5,
      deliveryFee: Number(restBody.deliveryFee) || 0,
      amenities: Array.isArray(restBody.amenities) 
        ? restBody.amenities 
        : (restBody.amenities ? restBody.amenities.split(',').map((item: string) => item.trim()).filter(Boolean) : []),
      gallery: Array.isArray(restBody.gallery) 
        ? restBody.gallery 
        : (restBody.gallery ? restBody.gallery.split(',').map((item: string) => item.trim()).filter(Boolean) : []),
    };

    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedCar });
  } catch (error) {
    console.error("Lỗi cập nhật xe:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật xe!" }, { status: 500 });
  }
}
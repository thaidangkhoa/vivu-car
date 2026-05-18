import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; 

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Nhận token (từ link email) và mật khẩu mới thay vì nhận userId
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Thiếu thông tin xác thực hoặc mật khẩu mới!" }, { status: 400 });
    }

    // 2. TÌM USER BẰNG TOKEN VÀ KIỂM TRA THỜI HẠN
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Điều kiện: Thời gian hết hạn phải lớn hơn thời gian hiện tại
        },
      },
    });

    // Nếu không tìm thấy user hoặc token đã hết hạn / đã bị dùng rồi
    if (!user) {
      return NextResponse.json(
        { error: "Đường dẫn khôi phục không hợp lệ, đã được sử dụng hoặc đã hết hạn!" }, 
        { status: 400 }
      );
    }

    // 3. BĂM MẬT KHẨU MỚI BẰNG BCRYPTJS
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. LƯU MẬT KHẨU VÀ TIÊU HỦY TOKEN (CHỐNG TÁI SỬ DỤNG)
    await prisma.user.update({
      where: { id: user.id }, // Dùng chính ID của user vừa quét ra được từ token an toàn
      data: { 
        password: hashedPassword,
        resetPasswordToken: null,   // Set về null để vô hiệu hóa link
        resetPasswordExpires: null, // Hủy luôn thời hạn
      },
    });

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công!" });

  } catch (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật mật khẩu." }, { status: 500 });
  }
}
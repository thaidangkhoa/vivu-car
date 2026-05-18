/* eslint-disable */
// @ts-nocheck
import React from "react";
import { ShieldCheck, Handshake, Printer, ChevronLeft, Building2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PartnerContractPage({ params }) {
  const { id } = await params;

  // Gọi Database lấy thông tin xe và chủ xe
  const car = await prisma.car.findUnique({
    where: { id: Number(id) },
    include: {
      user: true, 
    }
  });

  // Nếu không tìm thấy xe, báo lỗi 404
  if (!car) {
    return notFound();
  }

  //  CHẶN LOGIC: NẾU LÀ XE CÔNG TY THÌ KHÔNG CẦN HỢP ĐỒNG HỢP TÁC
  if (car.ownerType === "COMPANY") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-200 text-center max-w-md animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} />
          </div>
          <h1 className="text-xl font-black text-blue-900 uppercase italic mb-3 tracking-tight">Xe Thuộc Công Ty</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Phương tiện <strong className="text-gray-800">{car.licensePlate}</strong> thuộc sở hữu trực tiếp của nền tảng ViVuCar. Do đó, hệ thống không yêu cầu Hợp đồng hợp tác đối tác cho phương tiện này.
          </p>
          <Link href="/partner/dashboard" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black uppercase italic tracking-widest text-[11px] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all inline-block">
            Về trang quản lý
          </Link>
        </div>
      </main>
    );
  }

  // Xử lý ngày tháng ký hợp đồng
  const signDate = new Date(car.createdAt);
  const day = signDate.getDate().toString().padStart(2, '0');
  const month = (signDate.getMonth() + 1).toString().padStart(2, '0');
  const year = signDate.getFullYear();
  const time = signDate.toLocaleTimeString('vi-VN');
  const isSigned = car.contractAgreed || car.status === "APPROVED";

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-28 font-sans text-gray-800">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* KHU VỰC ĐIỀU HƯỚNG & IN ẤN */}
        <div className="print:hidden flex justify-between items-center mb-6">
            <Link href="/partner/dashboard" className="flex items-center gap-2 text-blue-600 font-black uppercase italic text-[10px] hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
                <ChevronLeft size={16} /> Về trang quản lý
            </Link>
            
            <div className="relative">
                <button 
                    id="btn-print-contract"
                    type="button"
                    className="flex items-center gap-2 text-gray-700 bg-white border shadow-sm font-black uppercase italic text-[10px] hover:bg-gray-50 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                    <Printer size={16} /> In hợp đồng
                </button>
                <script dangerouslySetInnerHTML={{ __html: `document.getElementById('btn-print-contract').addEventListener('click', function() { window.print(); })` }} />
            </div>
        </div>

        {/* HEADER HỢP ĐỒNG */}
        <div className="mb-8 text-center print:hidden">
          <h1 className="text-3xl font-black text-blue-900 uppercase italic flex items-center justify-center gap-3">
            <Handshake size={32} className="text-blue-600" /> Hợp Đồng Hợp Tác Điện Tử
          </h1>
          <p className="text-gray-500 font-medium mt-3 text-sm max-w-2xl mx-auto bg-blue-50 p-4 rounded-xl border border-blue-100">
            * Dữ liệu hợp đồng được trích xuất trực tiếp từ hệ thống. Hợp đồng có giá trị pháp lý tương đương văn bản giấy theo Luật Giao dịch điện tử.
          </p>
        </div>

        {/* NỘI DUNG HỢP ĐỒNG */}
        <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
            
            {/* QUỐC HIỆU */}
            <div className="text-center mb-8">
                <h3 className="font-bold text-lg uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</h3>
                <h4 className="font-bold text-base underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</h4>
            </div>

            {/* TIÊU ĐỀ */}
            <div className="text-center mb-10">
                <h1 className="font-black text-2xl md:text-3xl uppercase text-gray-900 mb-2">Hợp Đồng Hợp Tác Điện Tử</h1>
                <p className="text-sm font-medium text-gray-600 italic leading-relaxed">
                    Mã hợp đồng: <strong>PARTNER-{year}{car.id.toString().padStart(4, '0')}</strong> <br/>
                    Trạng thái: <span className="text-green-600 font-bold">{isSigned ? "Đã xác nhận ký điện tử" : "Đang chờ ký"}</span> <br/>
                    Hôm nay, ngày {day} tháng {month} năm {year}, chúng tôi gồm có:
                </p>
            </div>

            {/* BÊN A VÀ BÊN B CÓ DỮ LIỆU ĐỘNG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-b border-gray-200 pb-8">
                <div>
                    <h3 className="font-black text-blue-900 uppercase mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-2">
                        Bên A (Nền tảng ViVuCar)
                    </h3>
                    <ul className="space-y-3 text-sm font-medium">
                        <li><span className="text-gray-500">Đại diện:</span> <span className="font-bold text-gray-900 uppercase">Công ty TNHH Công nghệ ViVuCar (AutoHub AI)</span></li>
                        <li><span className="text-gray-500">Hotline:</span> <span className="font-bold text-gray-900">1900 8888</span></li>
                        <li><span className="text-gray-500">Vai trò:</span> Cung cấp nền tảng kết nối, quản lý giao dịch và bảo vệ quyền lợi các bên.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-black text-green-700 uppercase mb-4 flex items-center gap-2 border-l-4 border-green-600 pl-2">
                        Bên B (Đối tác/Chủ xe)
                    </h3>
                    <ul className="space-y-3 text-sm font-medium">
                        <li><span className="text-gray-500">Ông/Bà:</span> <span className="font-bold text-gray-900 uppercase">{car.ownerName || car.user?.name || "Chưa cập nhật"}</span></li>
                        <li><span className="text-gray-500">Số điện thoại:</span> <span className="font-bold text-gray-900">{car.ownerPhone || car.user?.phone || "Chưa cập nhật"}</span></li>
                        <li><span className="text-gray-500">Vai trò:</span> Chủ sở hữu phương tiện cung cấp dịch vụ cho thuê tự lái.</li>
                    </ul>
                </div>
            </div>

            {/* NỘI DUNG THỎA THUẬN CHUẨN KHỚP 100% BẢN MẪU */}
            <div className="space-y-6 text-sm font-medium leading-relaxed text-justify">
                <p>Sau khi thỏa thuận, hai bên thống nhất ký kết hợp đồng hợp tác với các điều khoản cụ thể như sau:</p>

                <div>
                    <h4 className="font-bold text-base text-gray-900 mb-2">ĐIỀU 1: NỘI DUNG HỢP TÁC</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Bên A cung cấp nền tảng phần mềm để Bên B đăng tải thông tin phương tiện (ô tô) mang biển kiểm soát <strong className="uppercase">{car.licensePlate || "Chưa cập nhật"}</strong> nhằm mục đích cho người dùng cuối (Khách hàng) thuê tự lái.</li>
                        <li>Bên B cam kết cung cấp phương tiện có đầy đủ giấy tờ pháp lý hợp lệ, đạt tiêu chuẩn an toàn kỹ thuật theo quy định hiện hành.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-base text-gray-900 mb-2 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-blue-600"/> ĐIỀU 2: KÝ QUỸ TRÁCH NHIỆM & BỒI THƯỜNG
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Để đảm bảo tính xác thực và trách nhiệm khi tham gia hệ thống, Bên B đồng ý đóng khoản <span className="font-bold text-red-600">Ký quỹ trách nhiệm là 2.000.000 VNĐ (Hai triệu đồng)</span> cho mỗi xe đăng ký. <span className="text-emerald-600 italic">(Trạng thái hệ thống: {car.isDepositPaid ? "Đã nhận ký quỹ" : "Chưa hoàn tất ký quỹ"})</span></li>
                        <li>Khoản ký quỹ này sẽ được lưu giữ tại hệ thống của Bên A và <strong>không được phép rút ra</strong> trong suốt thời gian Bên B duy trì trạng thái xe hoạt động.</li>
                        <li>Trường hợp Bên B đơn phương hủy chuyến đi của khách hàng đã xác nhận cọc mà không có lý do chính đáng (thiên tai, xe tai nạn có giấy tờ chứng minh), Bên A có quyền <strong>trừ trực tiếp tiền phạt vào khoản ký quỹ này</strong> để bồi thường cho khách hàng.</li>
                        <li>Khi Bên B ngừng hợp tác và xóa xe khỏi nền tảng, Bên A sẽ hoàn trả lại 100% số tiền ký quỹ (sau khi đã cấn trừ các khoản phạt vi phạm, nếu có) trong vòng 7 ngày làm việc.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-base text-gray-900 mb-2">ĐIỀU 3: PHÍ DỊCH VỤ VÀ THANH TOÁN</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Bên A thu chiết khấu <span className="font-bold text-blue-700">{car.commission || 15}%</span> trên tổng giá trị tiền thuê của mỗi chuyến đi hoàn thành thành công.</li>
                        <li>Tiền cọc của khách hàng (30%) sẽ do Bên A tạm giữ (Escrow) để đảm bảo giao dịch. Số tiền này sẽ được chuyển vào "Ví Đối Tác" của Bên B sau 24h kể từ khi kết thúc chuyến đi (nếu không có tranh chấp khiếu nại).</li>
                        <li>Khách hàng thanh toán phần tiền còn lại (70%) trực tiếp cho Bên B khi nhận xe.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-base text-gray-900 mb-2">ĐIỀU 4: XỬ LÝ TRANH CHẤP & GIAN LẬN</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Nếu Khách hàng sử dụng tính năng "Báo cáo sự cố" (Ví dụ: Chủ xe không giao xe, thu thêm phí sai quy định), đơn hàng sẽ chuyển sang trạng thái "Đang tranh chấp".</li>
                        <li>Bên A sẽ đóng vai trò trung gian xác minh. Nếu lỗi thuộc về Bên B (cố tình phá hoại, lừa đảo), Bên A có quyền: Hoàn cọc 100% cho khách, trừ tiền ký quỹ của Bên B, và cấm vĩnh viễn (Blacklist) tài khoản/biển số xe của Bên B khỏi hệ thống.</li>
                        <li>Trường hợp Khách hàng gây thiệt hại cho xe, Bên B sử dụng hợp đồng thuê xe ký trực tiếp với Khách hàng để giải quyết theo luật dân sự. Bên A sẽ hỗ trợ cung cấp hồ sơ lịch sử giao dịch.</li>
                    </ul>
                </div>
            </div>

            {/* CHỮ KÝ ĐIỆN TỬ */}
            <div className="mt-12 flex justify-between items-start pt-8 border-t border-gray-200">
                <div className="text-center w-1/2">
                    <h4 className="font-bold text-base uppercase text-gray-900">Đại diện Nền tảng (Bên A)</h4>
                    <p className="text-xs text-gray-400 italic mb-8">(Ký và đóng dấu điện tử)</p>
                    <div className="inline-block border-2 border-red-500 text-red-600 font-bold uppercase p-2 rounded-md mb-2 rotate-[-5deg]">
                        Đã xác thực<br/>ViVuCar
                    </div>
                    <p className="font-black text-blue-900 uppercase">CÔNG TY TNHH VIVUCAR</p>
                </div>
                
                <div className="text-center w-1/2">
                    <h4 className="font-bold text-base uppercase text-gray-900">Đối Tác (Bên B)</h4>
                    <p className="text-xs text-gray-400 italic mb-4">(Xác nhận bằng hành vi điện tử)</p>
                    
                    {isSigned ? (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-xl inline-block text-left text-[10px] text-green-800 font-medium">
                            <span className="block font-black text-green-700 uppercase mb-1 text-xs">✓ ĐÃ KÝ ĐIỆN TỬ</span>
                            IP: Hệ thống ghi nhận <br/>
                            Lúc: <strong>{time}</strong> <br/>
                            Ngày: <strong>{day}/{month}/{year}</strong> <br/>
                            Xác thực bởi: {car.user?.email || car.ownerPhone}
                        </div>
                    ) : (
                        <div className="bg-gray-100 border border-gray-200 p-3 rounded-xl inline-block text-gray-500 font-medium text-xs">
                            [Chưa xác nhận hợp đồng]
                        </div>
                    )}
                    <p className="font-black uppercase text-gray-900 mt-4">{car.ownerName || car.user?.name}</p>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}
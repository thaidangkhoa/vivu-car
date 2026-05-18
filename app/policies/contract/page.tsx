/* eslint-disable */
// @ts-nocheck
import React from "react";
import { FileText } from "lucide-react";

export default function ContractPolicyPage() {
  return (
    //  Giữ nguyên font-sans để đồng bộ phông chữ
    <main className="min-h-screen bg-gray-50 pb-20 pt-28 font-sans text-gray-800 flex flex-col items-center">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* HEADER BẢN MẪU */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-blue-900 uppercase italic flex items-center justify-center gap-3">
            <FileText size={32} className="text-blue-600" /> Bản Mẫu Hợp Đồng Thuê Xe
          </h1>
          <p className="text-gray-500 font-medium mt-3 text-sm max-w-2xl mx-auto bg-blue-50 p-4 rounded-xl border border-blue-100">
            * Đây là bản hợp đồng tiêu chuẩn được áp dụng trên nền tảng ViVuCar. Khi bạn tiến hành đặt xe và thanh toán thành công, hệ thống sẽ tự động điền thông tin cá nhân và chi tiết chuyến xe của bạn vào bản hợp đồng chính thức.
          </p>
        </div>

        {/* NỘI DUNG HỢP ĐỒNG (KHỚP 100% BẢN THỰC TẾ) */}
        <div className="bg-white p-10 md:p-16 rounded-[24px] shadow-sm border border-gray-200">
            
            {/* TIÊU ĐỀ QUỐC HIỆU */}
            <div className="text-center mb-8">
              <h2 className="font-bold text-lg uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
              <h3 className="font-bold text-base underline decoration-1 underline-offset-4">Độc lập - Tự do - Hạnh phúc</h3>
              <p className="italic text-sm mt-4 text-gray-500">
                Mã hợp đồng: VIVU-[Mã chuyến đi tự động sinh ra] <br/>
                Hôm nay, ngày ... tháng ... năm ..., chúng tôi gồm có:
              </p>
            </div>

            <h1 className="text-2xl font-black text-center mb-8 uppercase tracking-wide">HỢP ĐỒNG CHO THUÊ XE Ô TÔ TỰ LÁI</h1>

            {/* THÔNG TIN HAI BÊN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 border-b border-gray-200 pb-6 text-sm">
                <div>
                    <h3 className="font-black text-blue-900 uppercase mb-3 flex items-center gap-2 border-l-4 border-blue-600 pl-2">
                        Bên A (Chủ xe / Bên Cho Thuê)
                    </h3>
                    <ul className="space-y-2 font-medium">
                        <li><span className="text-gray-500">Đại diện:</span> <span className="font-bold text-gray-900 uppercase">[Tên chủ xe / Đại diện nền tảng]</span></li>
                        <li><span className="text-gray-500">Số điện thoại:</span> <span className="font-bold text-gray-900">[Số điện thoại chủ xe]</span></li>
                        <li><span className="text-gray-500">Nền tảng kết nối:</span> Ứng dụng ViVuCar (AutoHub AI)</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-black text-red-700 uppercase mb-3 flex items-center gap-2 border-l-4 border-red-600 pl-2">
                        Bên B (Người Thuê)
                    </h3>
                    <ul className="space-y-2 font-medium">
                        <li><span className="text-gray-500">Ông/Bà:</span> <span className="font-bold text-gray-900 uppercase">[Tên khách hàng thuê xe]</span></li>
                        <li><span className="text-gray-500">Số điện thoại:</span> <span className="font-bold text-gray-900">[Số điện thoại khách hàng]</span></li>
                        <li><span className="text-gray-500">CCCD số:</span> ....................................</li>
                        <li><span className="text-gray-500">GPLX số:</span> ................. Hạng: ............</li>
                    </ul>
                </div>
            </div>

            <p className="font-bold italic mt-2 mb-4 text-sm">Sau khi bàn bạc, hai bên thống nhất ký kết Hợp đồng thuê xe ô tô tự lái với các điều khoản sau đây:</p>

            {/* ĐIỀU KHOẢN HỢP ĐỒNG CHI TIẾT */}
            <div className="space-y-5 text-justify text-[13px] leading-relaxed">
              
              <section>
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">ĐIỀU 1: THÔNG TIN TÀI SẢN THUÊ & THỜI GIAN</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Tài sản thuê:</strong> Ô tô hiệu <span className="font-bold text-blue-700 uppercase">[Tên Dòng Xe - Năm sản xuất]</span>, Biển kiểm soát: <strong>[Biển số xe]</strong>.</li>
                  <li>Bên A giao xe tình trạng hoạt động bình thường, đầy đủ giấy tờ (Bản sao công chứng hoặc Bản gốc có biên nhận). Mức nhiên liệu và tình trạng xước xát (nếu có) được hai bên ghi nhận bằng hình ảnh thực tế lúc giao xe.</li>
                  <li><strong>Thời gian nhận xe:</strong> <span className="text-green-700 font-bold">[Giờ nhận - Ngày nhận]</span></li>
                  <li><strong>Thời gian trả xe:</strong> <span className="text-red-600 font-bold">[Giờ trả - Ngày trả]</span></li>
                  <li><strong>Địa điểm giao nhận:</strong> [Địa chỉ nhận xe do khách chọn hoặc thỏa thuận trực tiếp]</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG & TÀI SẢN THẾ CHẤP</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Tổng tiền thuê xe:</strong> <span className="font-bold text-blue-700">[Tổng tiền thuê] VNĐ</span> (Bao gồm chi phí bảo hiểm chuyến đi ViVuCar).</li>
                  <li><strong>Số tiền đã đặt cọc qua nền tảng:</strong> [Số tiền đặt cọc] VNĐ</li>
                  <li><strong>Tiền mặt thanh toán khi nhận xe:</strong> <span className="text-red-600 font-bold underline">[Số tiền còn lại] VNĐ</span></li>
                  <li><strong>Tài sản thế chấp (Bên B giao cho Bên A giữ):</strong> 01 Xe máy kèm Giấy đăng ký xe bản gốc (đứng tên Bên B hoặc người bảo lãnh) trị giá trên 15.000.000 VNĐ <strong>HOẶC</strong> đặt cọc tiền mặt 15.000.000 VNĐ. Tài sản này sẽ được hoàn trả 100% khi Bên B thanh lý hợp đồng và không phát sinh vi phạm.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">ĐIỀU 3: MỤC ĐÍCH SỬ DỤNG & CÁC HÀNH VI BỊ NGHIÊM CẤM</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  <li>Bên B chỉ sử dụng xe cho mục đích di chuyển cá nhân/gia đình. <strong className="text-red-600 text-[12px]">NGHIÊM CẤM DÙNG XE ĐỂ: Cầm cố, thế chấp, bán, cho thuê lại, chạy xe ghép, tập lái, đua xe trái phép.</strong></li>
                  <li>Tuyệt đối <strong>không sử dụng xe để vận chuyển vũ khí, ma túy, hàng lậu, hàng quốc cấm</strong>. Nếu vi phạm, Bên B chịu hoàn toàn trách nhiệm Hình sự trước pháp luật, Bên A miễn trừ mọi trách nhiệm liên đới.</li>
                  <li>Bên A có quyền đơn phương chấm dứt hợp đồng, thu hồi xe ngay lập tức và trình báo Cơ quan Công an nếu phát hiện Bên B có dấu hiệu vi phạm các điều cấm trên (thông qua định vị GPS).</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">ĐIỀU 4: TRÁCH NHIỆM KHI XẢY RA SỰ CỐ, TAI NẠN, PHẠT NGUỘI</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  <li><strong>Phạt giao thông:</strong> Bên B chịu trách nhiệm thanh toán 100% các khoản phạt vi phạm giao thông (phạt nóng, phạt nguội) phát sinh trong khoảng thời gian thuê xe (Dựa trên hình ảnh/biên bản của CSGT).</li>
                  <li><strong>Hư hỏng & Tai nạn:</strong> Nếu xe xảy ra va quẹt, tai nạn, Bên B phải giữ nguyên hiện trường, thông báo ngay cho Bên A và Nền tảng ViVuCar để gọi Bảo hiểm. 
                    <br/> - Bên B có trách nhiệm thanh toán chi phí sửa chữa theo báo giá của Gara chính hãng.
                    <br/> - Trong thời gian xe nằm Gara sửa chữa, Bên B phải <strong>bồi thường thiệt hại ngày nghỉ xe cho Bên A</strong> tính theo đơn giá thuê xe của hợp đồng này nhân với số ngày xe nằm xưởng.</li>
                  <li><strong>Trả xe trễ hạn:</strong> Nếu trả xe quá thời gian quy định tại Điều 1 mà không báo trước, Bên B chịu phí phạt 100.000 VNĐ/giờ. Quá 12 tiếng không liên lạc được, Bên A có quyền trình báo Công an tội Lạm dụng tín nhiệm chiếm đoạt tài sản.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">ĐIỀU 5: CAM KẾT CHUNG</h3>
                <p className="pl-5">Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận. Mọi tranh chấp phát sinh sẽ được giải quyết qua thương lượng. Nếu không tự giải quyết được sẽ đưa ra Tòa án nhân dân có thẩm quyền tại địa phương. Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
              </section>
            </div>

            {/* CHỮ KÝ */}
            <div className="grid grid-cols-2 text-center mt-10 pt-6 border-t border-gray-200">
              <div className="relative">
                <h3 className="font-bold text-[15px] uppercase">ĐẠI DIỆN BÊN A (CHỦ XE)</h3>
                <p className="italic text-[11px] text-gray-400 mb-20">(Ký, điểm chỉ và ghi rõ họ tên)</p>
                
                {/* CON DẤU BẢN MẪU */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none hidden md:flex">
                  <div className="w-20 h-20 border-[3px] border-gray-500 rounded-full flex items-center justify-center rotate-[-15deg]">
                    <span className="text-gray-500 font-black uppercase text-[9px] text-center leading-tight">BẢN MẪU<br/>VIVUCAR</span>
                  </div>
                </div>

                <p className="font-black uppercase text-gray-400">[Chữ ký bên A]</p>
              </div>

              <div>
                <h3 className="font-bold text-[15px] uppercase">ĐẠI DIỆN BÊN B (NGƯỜI THUÊ)</h3>
                <p className="italic text-[11px] text-gray-400 mb-20">(Ký, điểm chỉ và ghi rõ họ tên)</p>
                <p className="font-black uppercase text-gray-400">[Chữ ký bên B]</p>
              </div>
            </div>

        </div>
      </div>
    </main>
  );
}
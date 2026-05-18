/* eslint-disable */
import { FileText, CheckCircle2, ShieldAlert, CreditCard, Scale, Handshake } from "lucide-react";

export const metadata = { title: "Điều kiện giao dịch chung | ViVuCar" };

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-8 flex items-center gap-4">
        <FileText className="text-blue-600 w-10 h-10 shrink-0" /> Điều kiện giao dịch chung
      </h1>
      
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8 text-sm font-medium text-blue-900">
        Tài liệu này là một phần không thể tách rời của Hợp đồng điện tử và Điều khoản sử dụng nền tảng AutoHub AI (ViVuCar). Quy định chi tiết các nguyên tắc, quy trình chuẩn và trách nhiệm cụ thể trong quá trình thực hiện giao dịch thuê xe tự lái trên hệ thống.
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed font-medium text-[15px] text-justify">
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Handshake size={20} className="text-blue-600" /> 1. Nguyên tắc giao dịch
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Nền tảng ViVuCar hoạt động theo mô hình Sàn giao dịch Thương mại Điện tử, cung cấp giải pháp kết nối trực tiếp giữa Người có xe cho thuê (Chủ xe / Đối tác) và Người có nhu cầu thuê xe (Khách hàng).</li>
            <li>Mọi giao dịch thuê xe phải được thực hiện một cách tự nguyện, bình đẳng, tôn trọng quyền và lợi ích hợp pháp của các bên tham gia, và tuân thủ nghiêm ngặt pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</li>
            <li>Hệ thống AI Chatbot của nền tảng hỗ trợ tư vấn thông tin dựa trên dữ liệu thuật toán, tuy nhiên quyết định thanh toán, thuê xe và bàn giao tài sản là quyết định độc lập của người dùng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-blue-600" /> 2. Quy trình thực hiện giao dịch chuẩn
          </h2>
          <ul className="list-decimal pl-5 space-y-2">
            <li><strong>Bước 1 (Đặt xe):</strong> Khách hàng tìm kiếm, lựa chọn phương tiện phù hợp dựa trên thời gian, địa điểm và gửi yêu cầu đặt xe trên hệ thống.</li>
            <li><strong>Bước 2 (Xác nhận & Đặt cọc):</strong> Sau khi yêu cầu được duyệt, Khách hàng tiến hành thanh toán khoản đặt cọc (30% tổng giá trị chuyến đi) thông qua cổng thanh toán tích hợp của ViVuCar để giữ chỗ. Số tiền này sẽ được hệ thống lưu giữ trung gian (Escrow).</li>
            <li><strong>Bước 3 (Giao nhận xe):</strong> Khách hàng và Chủ xe gặp nhau tại địa điểm đã hẹn. Khách hàng xuất trình giấy tờ (CCCD, GPLX), thanh toán 70% số tiền còn lại và bàn giao tài sản thế chấp (15 triệu VNĐ hoặc Xe máy kèm cà vẹt gốc) cho Chủ xe. Hai bên kiểm tra tình trạng xe, chụp ảnh hiện trạng và ký xác nhận Biên bản bàn giao.</li>
            <li><strong>Bước 4 (Kết thúc chuyến đi):</strong> Khách hàng hoàn trả phương tiện đúng giờ, đúng tình trạng ban đầu. Chủ xe kiểm tra lại xe, hoàn trả 100% tài sản thế chấp cho khách hàng (nếu không có vi phạm) và xác nhận kết thúc đơn hàng trên ứng dụng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" /> 3. Chính sách giá và Cấu trúc chi phí
          </h2>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Giá thuê cơ bản:</strong> Được Chủ xe niêm yết công khai. Giá có thể thay đổi tùy thời điểm (Ngày thường, Cuối tuần, Lễ/Tết) nhưng sẽ được chốt cố định khi Khách hàng thanh toán cọc thành công.</li>
              <li><strong>Phí dịch vụ nền tảng:</strong> ViVuCar thu chiết khấu hoa hồng trên tổng doanh thu của Chủ xe theo tỷ lệ đã ký kết trong Hợp đồng hợp tác đối tác.</li>
              <li><strong>Phí bảo hiểm chuyến đi:</strong> Mức phí cố định thu trên mỗi đơn hàng nhằm kích hoạt gói bảo hiểm vật chất xe cơ giới trong suốt thời gian Khách hàng sử dụng xe.</li>
              <li><strong>Phụ phí phát sinh (Thanh toán ngoài hệ thống):</strong> Bao gồm phí giao nhận xe tận nơi, phí rửa xe (nếu trả xe bẩn), phụ phí vượt giới hạn số KM/ngày, và phí trả xe trễ giờ (Quy định chuẩn: 100.000 VNĐ/giờ).</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2 text-blue-800">
            <ShieldAlert size={20} /> 4. Quyền và Nghĩa vụ của Chủ xe
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Quyền lợi:</strong> Được toàn quyền <strong>từ chối giao xe</strong> (và giữ lại tiền cọc của khách) nếu Khách hàng không cung cấp đủ giấy tờ hợp pháp, có biểu hiện say xỉn, sử dụng chất kích thích, hoặc không đủ tài sản thế chấp lúc nhận xe.</li>
            <li><strong>Nghĩa vụ:</strong> Đảm bảo phương tiện giao cho khách đúng nhãn hiệu, đúng biển số, đầy đủ giấy tờ xe và đạt tiêu chuẩn an toàn kỹ thuật. Không được tự ý hủy chuyến khi Khách hàng đã cọc trừ trường hợp bất khả kháng. Nếu tự ý hủy, Chủ xe sẽ bị trừ tiền vào khoản Ký quỹ trách nhiệm.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2 text-red-700">
            <ShieldAlert size={20} /> 5. Quyền và Nghĩa vụ của Khách hàng
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Quyền lợi:</strong> Được quyền từ chối nhận xe và yêu cầu Nền tảng hoàn trả 100% tiền cọc nếu Chủ xe giao xe sai thông tin, không đúng biển kiểm soát, xe không có giấy tờ hợp lệ hoặc xe bị lỗi kỹ thuật nghiêm trọng (hỏng phanh, lốp mòn).</li>
            <li><strong>Nghĩa vụ:</strong> Trực tiếp cầm lái và tự chịu hoàn toàn trách nhiệm dân sự, hình sự trong suốt thời gian thuê xe. Phải tự chi trả chi phí nhiên liệu, phí cầu đường (ETC) và <strong>chịu trách nhiệm nộp phạt 100% các lỗi vi phạm giao thông (kể cả phạt nguội phát hiện sau khi trả xe)</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Scale size={20} className="text-blue-600" /> 6. Cơ chế giải quyết tranh chấp
          </h2>
          <p className="mb-3">Nền tảng ViVuCar ưu tiên giải quyết khiếu nại thông qua thương lượng, hòa giải nhằm bảo vệ quyền lợi hợp pháp của cả hai bên. Quy trình xử lý như sau:</p>
          <div className="space-y-3">
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="font-bold text-blue-900 mb-1">Cấp độ 1: Tự thỏa thuận</p>
              <p className="text-sm text-gray-600">Chủ xe và Khách hàng chủ động thương lượng để giải quyết các sự cố phát sinh (trễ giờ, bồi thường xước xát nhỏ) dựa trên Biên bản bàn giao lúc nhận xe.</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="font-bold text-blue-900 mb-1">Cấp độ 2: Hòa giải qua nền tảng</p>
              <p className="text-sm text-gray-600">Nếu hai bên không thể tự thống nhất, một trong hai bên sử dụng tính năng "Báo cáo sự cố". ViVuCar sẽ đóng vai trò trung gian xác minh, thu thập bằng chứng (GPS, lịch sử giao dịch) để đưa ra phán quyết về việc hoàn/trừ tiền cọc và ký quỹ.</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="font-bold text-blue-900 mb-1">Cấp độ 3: Can thiệp pháp luật</p>
              <p className="text-sm text-gray-600">Đối với các sự cố nghiêm trọng (Lừa đảo, chiếm đoạt tài sản, tai nạn giao thông nghiêm trọng), ViVuCar sẽ cung cấp toàn bộ hồ sơ điện tử, hợp đồng cho Cơ quan Công an và Tòa án để xử lý theo quy định pháp luật.</p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
/* eslint-disable */
import { MonitorSmartphone, Scale, Shield, AlertTriangle } from "lucide-react";

export const metadata = { title: "Điều khoản sử dụng nền tảng | ViVuCar" };

export default function PlatformTermsPage() {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-8 flex items-center gap-4">
        <MonitorSmartphone className="text-blue-600 w-10 h-10 shrink-0" /> Điều khoản sử dụng
      </h1>
      
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8">
        <p className="text-sm font-medium text-blue-900">
          Chào mừng bạn đến với Nền tảng AutoHub AI (ViVuCar). Bằng việc truy cập, tạo tài khoản và sử dụng các dịch vụ trên website/ứng dụng của chúng tôi, bạn được xem là đã đọc, hiểu rõ và đồng ý chịu sự ràng buộc của toàn bộ các Điều khoản sử dụng dưới đây.
        </p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed font-medium text-justify text-[15px]">
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            1. Vai trò của nền tảng AutoHub AI
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>AutoHub AI là <strong>nền tảng công nghệ trung gian</strong>, cung cấp giải pháp kết nối trực tuyến giữa người có nhu cầu thuê xe và đối tác có xe cho thuê.</li>
            <li>Trừ các xe thuộc sở hữu trực tiếp của công ty, AutoHub AI không phải là đơn vị kinh doanh vận tải và không trực tiếp sở hữu các phương tiện của Đối tác đăng tải trên hệ thống.</li>
            <li>Chúng tôi cung cấp công cụ AI Chatbot, hệ thống quản lý lịch trình và cổng thanh toán để đảm bảo sự minh bạch, an toàn cho các giao dịch.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            2. Tài khoản và Bảo mật thông tin
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Người dùng phải cung cấp thông tin cá nhân (Họ tên, Số điện thoại, CCCD, GPLX) chính xác và trung thực khi đăng ký tài khoản (KYC).</li>
            <li>Hành vi sử dụng giấy tờ giả mạo, mượn danh tính người khác để đăng ký tài khoản sẽ bị <strong>khóa vĩnh viễn</strong> và chuyển hồ sơ cho Cơ quan Công an nếu có dấu hiệu lừa đảo.</li>
            <li>Bạn có trách nhiệm tự bảo vệ thông tin đăng nhập và mật khẩu (OTP). Nền tảng không chịu trách nhiệm đối với bất kỳ tổn thất nào phát sinh do tài khoản của bạn bị truy cập trái phép từ lỗi cá nhân.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            3. Bản quyền tài sản trí tuệ
          </h2>
          <p className="mb-2">Toàn bộ thiết kế, mã nguồn, thuật toán AI, logo, thương hiệu ViVuCar và tài liệu trên website đều thuộc sở hữu độc quyền của Công ty TNHH AutoHub Việt Nam.</p>
          <p>Nghiêm cấm mọi hành vi sao chép, trích xuất dữ liệu tự động (Crawl data), dịch ngược mã nguồn (Reverse engineering) hoặc sử dụng hình ảnh thương hiệu để trục lợi khi chưa được sự đồng ý bằng văn bản.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2 text-red-700">
            4. Các hành vi bị nghiêm cấm trên nền tảng
          </h2>
          <div className="bg-red-50 p-5 rounded-xl border border-red-100 text-red-900">
            <p className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Nền tảng áp dụng chính sách KHÔNG khoan nhượng với các hành vi sau:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sử dụng nền tảng để môi giới các dịch vụ bất hợp pháp, rửa tiền, lừa đảo chiếm đoạt tài sản (Cầm cắm xe).</li>
              <li>Đăng tải phương tiện không tồn tại, phương tiện đang tranh chấp pháp lý hoặc dùng hình ảnh giả mạo để nhận tiền cọc của khách hàng.</li>
              <li>Sử dụng các công cụ tự động, Bot, Spam để tạo ra các cuốc xe ảo gây gián đoạn hệ thống (DDoS) hoặc làm sai lệch thuật toán xếp hạng xe.</li>
              <li>Bình luận, đánh giá (Review) chứa nội dung phản cảm, vi phạm thuần phong mỹ tục hoặc bôi nhọ danh dự người khác.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            5. Giao dịch và Thanh toán qua hệ thống
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Nền tảng đóng vai trò là bên giữ tiền trung gian (Escrow) đối với khoản <strong>Tiền cọc (30%)</strong> của Khách hàng để bảo vệ quyền lợi cho cả hai bên.</li>
            <li>Tuyệt đối không thực hiện các giao dịch chuyển tiền trực tiếp cho Đối tác ngoài hệ thống khi chưa có xác nhận đơn hàng thành công từ AutoHub AI. Nền tảng sẽ không giải quyết các khiếu nại lừa đảo nếu giao dịch diễn ra bên ngoài.</li>
            <li>Khoản phí dịch vụ (chiết khấu) và Phí bảo hiểm chuyến đi sẽ được tính toán tự động và hiển thị minh bạch trước khi người dùng bấm xác nhận thanh toán.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            6. Miễn trừ trách nhiệm pháp lý
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>AutoHub AI không chịu trách nhiệm pháp lý đối với bất kỳ tai nạn giao thông, vi phạm luật pháp (chở hàng cấm, gây án) hoặc tranh chấp hợp đồng dân sự nào phát sinh giữa Khách hàng và Chủ xe.</li>
            <li>Hệ thống có thể tạm ngừng hoạt động để bảo trì, nâng cấp định kỳ. Chúng tôi được miễn trừ trách nhiệm bồi thường đối với các thiệt hại gián tiếp phát sinh từ việc hệ thống bị lỗi kỹ thuật, gián đoạn do nhà cung cấp mạng hoặc sự kiện bất khả kháng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            7. Xử lý vi phạm và Chấm dứt dịch vụ
          </h2>
          <p>Ban quản trị AutoHub AI có toàn quyền đình chỉ tạm thời hoặc xóa vĩnh viễn tài khoản của bất kỳ người dùng nào vi phạm các Điều khoản trên mà không cần báo trước. Số tiền trong Ví của tài khoản vi phạm (nếu có) sẽ bị đóng băng để phục vụ công tác đối soát hoặc bồi thường thiệt hại.</p>
        </section>

      </div>
    </>
  );
}
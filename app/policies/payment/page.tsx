/* eslint-disable */
import { CreditCard, ShieldCheck, Wallet, Banknote, History, AlertCircle, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Phương thức thanh toán | ViVuCar" };

export default function PaymentPage() {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-8 flex items-center gap-4">
        <CreditCard className="text-blue-600 w-10 h-10 shrink-0" /> Phương thức thanh toán
      </h1>
      
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8 text-sm font-medium text-blue-900 flex items-start gap-3">
        <ShieldCheck className="text-blue-600 w-6 h-6 shrink-0 mt-0.5" />
        <p>
          AutoHub AI (ViVuCar) cam kết bảo mật tuyệt đối thông tin giao dịch của khách hàng. Chúng tôi không trực tiếp lưu trữ thông tin thẻ của bạn. Mọi giao dịch trực tuyến đều được mã hóa theo tiêu chuẩn quốc tế (PCI DSS) thông qua cổng thanh toán VNPAY.
        </p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed font-medium text-[15px] text-justify">
        
        {/* CƠ CHẾ THANH TOÁN 30/70 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet size={20} className="text-blue-600" /> 1. Cơ chế thanh toán chia đợt (30/70)
          </h2>
          <p className="mb-4">Để đảm bảo quyền lợi và sự cam kết giữa Khách hàng và Chủ xe, ViVuCar áp dụng cơ chế thanh toán chia làm 2 đợt rõ ràng:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
              <h3 className="font-black text-blue-800 uppercase mb-2">Đợt 1: Đặt cọc giữ xe (30%)</h3>
              <p className="text-sm text-gray-600">
                Thanh toán ngay trên nền tảng ViVuCar để hệ thống chốt lịch và giữ xe cho bạn. Số tiền này do hệ thống tạm giữ (Escrow) để đảm bảo giao dịch an toàn.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-green-300 transition-colors">
              <h3 className="font-black text-green-700 uppercase mb-2">Đợt 2: Thanh toán còn lại (70%)</h3>
              <p className="text-sm text-gray-600">
                Thanh toán trực tiếp cho Chủ xe (bằng Tiền mặt hoặc Chuyển khoản) tại thời điểm bạn đến nhận xe và ký biên bản bàn giao thành công.
              </p>
            </div>
          </div>
        </section>

        {/* CÁC HÌNH THỨC HỖ TRỢ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Banknote size={20} className="text-blue-600" /> 2. Hình thức thanh toán trực tuyến
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Quét mã VNPAY-QR:</strong> Nhanh chóng, tiện lợi bằng ứng dụng Mobile Banking của hơn 40 ngân hàng tại Việt Nam (Vietcombank, BIDV, Techcombank, MBBank...).
            </li>
            <li>
              <strong>Thẻ ATM / Tài khoản ngân hàng nội địa:</strong> Hỗ trợ thanh toán qua thẻ ATM nội địa đã đăng ký dịch vụ Internet Banking.
            </li>
            <li>
              <strong>Thẻ thanh toán quốc tế:</strong> Hỗ trợ các loại thẻ tín dụng/ghi nợ mang thương hiệu Visa, MasterCard, JCB, UnionPay.
            </li>
          </ul>
        </section>

        {/* CHÍNH SÁCH HOÀN TIỀN */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 text-red-700">
            <History size={20} /> 3. Chính sách Hủy chuyến & Hoàn cọc
          </h2>
          <div className="bg-red-50 border border-red-100 p-5 rounded-xl">
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Hoàn cọc 100%:</strong> 
                    <p className="text-sm text-gray-700 mt-1">Trường hợp Khách hàng chủ động hủy chuyến <strong>trước 24 giờ</strong> (tính đến thời điểm nhận xe). Hoặc trường hợp Chủ xe tự ý hủy chuyến/giao xe không đúng cam kết (sai biển số, sai loại xe).</p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-800">Không hoàn cọc (Mất cọc):</strong> 
                    <p className="text-sm text-gray-700 mt-1">Trường hợp Khách hàng hủy chuyến <strong>dưới 24 giờ</strong> (tiền cọc sẽ được bồi thường cho Chủ xe). Hoặc trường hợp đến ngày nhận xe, Khách hàng không cung cấp đủ giấy tờ (CCCD, GPLX) và tài sản thế chấp (5 triệu/Xe máy) như quy định.</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-gray-500 italic">
            * Thời gian xử lý hoàn tiền: Từ 1 - 3 giờ làm việc (sau khi đã kiểm tra toàn bộ thông tin). Tiền hoàn sẽ được tự động chuyển trả về đúng tài khoản/thẻ mà quý khách đã sử dụng để thanh toán.
          </p>
        </section>

        {/* PHỤ PHÍ PHÁT SINH */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600" /> 4. Các chi phí phát sinh (Thanh toán ngoài)
          </h2>
          <p className="mb-2 text-gray-600">Các khoản phí dưới đây (nếu có) sẽ không thu qua hệ thống ViVuCar mà được Khách hàng thanh toán trực tiếp cho Chủ xe lúc trả xe:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li><strong>Phí trả xe trễ giờ:</strong> Phụ thu 100.000 VNĐ cho mỗi giờ trả trễ so với hợp đồng.</li>
            <li><strong>Phí vệ sinh:</strong> Từ 100.000đ - 150.000đ nếu xe trả lại trong tình trạng quá bẩn, có mùi hải sản/sầu riêng, bùn đất bám đầy nội thất.</li>
            <li><strong>Phí vượt số KM:</strong> Tùy thuộc vào quy định riêng của từng Chủ xe (thường dao động từ 3.000đ - 5.000đ/km vượt mức giới hạn).</li>
          </ul>
        </section>

      </div>
    </>
  );
}
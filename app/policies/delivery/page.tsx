/* eslint-disable */
import { Truck, MapPin, ClipboardCheck, Camera, FileSignature, KeyRound, Clock, AlertTriangle } from "lucide-react";

export const metadata = { title: "Chính sách giao nhận | ViVuCar" };

export default function DeliveryPage() {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-black text-blue-900 uppercase italic tracking-tighter mb-8 flex items-center gap-4">
        <Truck className="text-blue-600 w-10 h-10 shrink-0" /> Chính sách giao nhận xe
      </h1>
      
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8 text-sm font-medium text-blue-900">
        Để đảm bảo tính minh bạch và bảo vệ quyền lợi của cả Chủ xe lẫn Người thuê, quy trình giao nhận xe tại hệ thống AutoHub AI (ViVuCar) được thiết kế chặt chẽ, bao gồm các bước xác thực, đồng kiểm và ký kết hợp đồng rõ ràng.
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed font-medium text-[15px] text-justify">

        {/* HÌNH THỨC GIAO NHẬN */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" /> 1. Các hình thức giao nhận xe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:border-blue-300 transition-colors">
              <h3 className="font-bold text-blue-800 mb-2">Tự nhận xe tại bãi (Miễn phí)</h3>
              <p className="text-sm">Khách hàng di chuyển đến địa chỉ bãi đậu xe hoặc nhà riêng của Chủ xe (được cung cấp chi tiết trên hệ thống sau khi đặt cọc thành công) để nhận xe.</p>
            </div>
            <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:border-blue-300 transition-colors">
              <h3 className="font-bold text-blue-800 mb-2">Giao xe tận nơi (Có thu phí)</h3>
              <p className="text-sm">Chủ xe hỗ trợ giao xe đến tận nhà, khách sạn hoặc sân bay. Phí giao nhận được tính toán tự động dựa trên khoảng cách (hoặc theo thỏa thuận giữa hai bên).</p>
            </div>
          </div>
        </section>

        {/* QUY TRÌNH NHẬN XE CHUẨN */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <KeyRound size={20} className="text-blue-600" /> 2. Quy trình nhận xe (Check-in)
          </h2>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl shrink-0 mt-1"><ClipboardCheck size={20} /></div>
              <div>
                <strong className="text-gray-900 text-base">Bước 1: Xác thực danh tính & Tài sản thế chấp</strong>
                <p className="text-sm text-gray-600 mt-1">Người thuê bắt buộc xuất trình bản gốc CCCD gắn chip và Giấy phép lái xe (GPLX) hợp lệ để Chủ xe đối chiếu. Sau đó, tiến hành bàn giao tài sản thế chấp cho Chủ xe giữ (15.000.000 VNĐ tiền mặt <strong>HOẶC</strong> 01 Xe máy kèm giấy đăng ký gốc có giá trị tương đương).</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl shrink-0 mt-1"><Camera size={20} /></div>
              <div>
                <strong className="text-gray-900 text-base">Bước 2: Đồng kiểm hiện trạng xe</strong>
                <p className="text-sm text-gray-600 mt-1">Hai bên cùng kiểm tra kỹ ngoại thất (vết xước, móp méo), nội thất, mức nhiên liệu hiện tại và các giấy tờ xe đi kèm (Bản photo công chứng hoặc bản gốc có biên nhận thế chấp). <strong>Bắt buộc phải chụp ảnh/quay video</strong> lại để làm bằng chứng pháp lý đối soát sau này.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl shrink-0 mt-1"><FileSignature size={20} /></div>
              <div>
                <strong className="text-gray-900 text-base">Bước 3: Ký hợp đồng & Thanh toán</strong>
                <p className="text-sm text-gray-600 mt-1">Hai bên tiến hành đọc kỹ và ký xác nhận vào <strong>Hợp đồng thuê xe tự lái</strong> (Sử dụng bản Hợp đồng điện tử xuất từ hệ thống ViVuCar hoặc bản giấy do Chủ xe in sẵn). Khách hàng thanh toán 70% giá trị chuyến đi còn lại cho Chủ xe bằng tiền mặt hoặc chuyển khoản và nhận chìa khóa.</p>
              </div>
            </li>
          </ul>
        </section>

        {/* QUY TRÌNH TRẢ XE */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" /> 3. Quy trình trả xe (Check-out)
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Khách hàng hoàn trả xe đúng địa điểm và thời gian quy định trong hợp đồng. Nếu có phát sinh trả trễ, vui lòng thông báo trước cho Chủ xe (phụ phí trả trễ thông thường: 100.000 VNĐ/giờ).</li>
            <li>Chủ xe đối chiếu tình trạng xe hiện tại với hình ảnh/video đồng kiểm lúc giao. Khách hàng cần hoàn trả xe với mức nhiên liệu bằng với mức ban đầu.</li>
            <li>Nếu không có phát sinh vi phạm giao thông, xước xát hay phạt nguội, Chủ xe hoàn trả lại 100% tài sản thế chấp (Tiền mặt/Xe máy) cho Khách hàng. Hai bên xác nhận kết thúc đơn hàng trên hệ thống ViVuCar.</li>
          </ul>
        </section>

        {/* LƯU Ý QUAN TRỌNG */}
        <section className="bg-red-50 border border-red-100 p-5 rounded-xl">
          <h2 className="text-[16px] font-bold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} /> Lưu ý quan trọng
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
            <li>ViVuCar có quyền từ chối hỗ trợ giải quyết tranh chấp pháp lý nếu hai bên bỏ qua bước chụp ảnh đồng kiểm và không ký Hợp đồng thuê xe lúc giao nhận.</li>
            <li>Khách hàng <strong>tuyệt đối không nhận xe</strong> nếu phát hiện phương tiện không đảm bảo an toàn kỹ thuật (mòn lốp, hỏng phanh) hoặc sai lệch thông tin biển số, nhãn hiệu so với đơn đặt hàng trên hệ thống. Trong trường hợp này, hãy báo ngay cho bộ phận CSKH để được hoàn cọc 100%.</li>
          </ul>
        </section>

      </div>
    </>
  );
}
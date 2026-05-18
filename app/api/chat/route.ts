import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import prisma from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let buildWhere: any = { status: "APPROVED" }; 
    let orderByConfig: any = { createdAt: "desc" }; 

    const userMessages = messages.filter((m: any) => m.role === "user");

    const locations: Record<string, string> = {
      "hà nội": "HaNoi", "ha noi": "HaNoi", 
      "hcm": "TPHCM", "hồ chí minh": "TPHCM", "sài gòn": "TPHCM", 
      "đà nẵng": "DaNang", "da nang": "DaNang",
      "nha trang": "NhaTrang", "phú quốc": "PhuQuoc", 
      "đà lạt": "DaLat", "da lat": "DaLat",
      "hạ long": "HaLong", "ha long": "HaLong", "vũng tàu": "VungTau",
      "cần thơ": "CanTho", "hội an": "HoiAn", "huế": "Hue", "quy nhơn": "QuyNhon"
    };

    const brands: Record<string, string> = {
      "toyota": "Toyota", "vinfast": "Vinfast", "vin": "Vinfast", 
      "hyundai": "Hyundai", "ford": "Ford", "mitsubishi": "Mitsubishi", "mitsu": "Mitsubishi",
      "kia": "Kia", "mazda": "Mazda", "honda": "Honda", "suzuki": "Suzuki", 
      "mercedes": "Mercedes", "mẹc": "Mercedes", "bmw": "BMW", "bim": "BMW",
      "audi": "Audi", "porsche": "Porsche", "lexus": "Lexus", "peugeot": "Peugeot",
      "land rover": "LandRover", "chevrolet": "Chevrolet", "nissan": "Nissan"
    };

    const categories: Record<string, string> = {
      "sedan": "Sedan", "suv": "SUV", "hatchback": "Hatchback", "mpv": "MPV",
      "bán tải": "Pickup", "ban tai": "Pickup", "pickup": "Pickup", 
      "thể thao": "Sport", "the thao": "Sport"
    };

    // QUÉT TỪNG CÂU NÓI ĐỂ LẤY NGỮ CẢNH
    userMessages.forEach((msg: any) => {
      const rawText = msg.content.toLowerCase();
      const paddedText = ` ${rawText.replace(/[.,!?]/g, ' ')} `;

      // 1. Quét Địa điểm
      for (const [key, val] of Object.entries(locations)) {
        if (rawText.includes(key)) buildWhere.location = val;
      }
      if (paddedText.includes(" hn ")) buildWhere.location = "HaNoi";
      if (paddedText.includes(" sg ")) buildWhere.location = "TPHCM";
      if (paddedText.includes(" vt ")) buildWhere.location = "VungTau";

      // 2. Quét Hãng và Dáng xe
      for (const [key, val] of Object.entries(brands)) {
        if (rawText.includes(key)) buildWhere.brand = val;
      }
      for (const [key, val] of Object.entries(categories)) {
        if (rawText.includes(key)) buildWhere.category = val;
      }

      // 3. Quét tiếng lóng dáng xe
      if (rawText.includes("gầm cao") || rawText.includes("đi phượt")) buildWhere.category = { in: ["SUV", "Pickup"] };
      else if (rawText.includes("nhỏ gọn") || rawText.includes("đi phố")) buildWhere.category = { in: ["Hatchback", "Sedan"] };
      else if (rawText.includes("gia đình") || rawText.includes("chở nhiều đồ")) buildWhere.category = { in: ["MPV", "SUV"] };
      else if (rawText.includes("sang trọng") || rawText.includes("xe cưới")) buildWhere.tier = "Luxury";

      // ==========================================================
      //  4. QUÉT NHIÊN LIỆU & HỘP SỐ (BẮT CÂU PHỦ ĐỊNH THÔNG MINH)
      // ==========================================================
      const isNotEV = rawText.match(/không\s*(thích|muốn|cần|lấy|thuê|chạy|đi|chọn|khoái).*(xe điện|ev)/);
      if (isNotEV) {
        buildWhere.fuel = { not: "Electric" }; // Ép DB loại bỏ hoàn toàn xe điện
      } else if (rawText.includes("xe điện") || rawText.includes("ev")) {
        buildWhere.fuel = "Electric";
      } else if (rawText.includes("xe xăng")) {
        buildWhere.fuel = "Gasoline";
      } else if (rawText.includes("máy dầu") || rawText.includes("xe dầu")) {
        buildWhere.fuel = "Diesel";
      }

      const isNotMT = rawText.match(/không\s*(thích|muốn|cần|lấy|thuê|chạy|đi|chọn|khoái).*(số sàn|mt)/);
      if (isNotMT) {
        buildWhere.transmission = "Automatic"; // Ghét số sàn thì mặc định đẩy qua số tự động
      } else if (rawText.includes("số tự động") || rawText.includes("at")) {
        buildWhere.transmission = "Automatic";
      } else if (rawText.includes("số sàn") || rawText.includes("mt")) {
        buildWhere.transmission = "Manual";
      }
      
      if (rawText.includes("cũng được") || rawText.includes("bỏ qua") || rawText.includes("sao cũng được")) {
        delete buildWhere.fuel; 
        delete buildWhere.transmission;
      }

      // ==========================================================
      // 5. QUÉT SỐ NGƯỜI / CHỖ NGỒI
      // ==========================================================
      const peopleMatch = rawText.match(/(\d+)\s*(người|chỗ|mạng|thành viên|anh em|ae)/);
      if (peopleMatch) {
        const num = parseInt(peopleMatch[1]);
        if (num <= 2) delete buildWhere.seats; 
        else if (num > 2 && num <= 5) buildWhere.seats = 5; 
        else if (num > 5 && num <= 7) buildWhere.seats = 7; 
        else buildWhere.seats = 16;
      }

      // 6. Quét ưu tiên giá
      if (rawText.includes("rẻ") || rawText.includes("tiết kiệm")) orderByConfig = { priceOriginal: "asc" };
      else if (rawText.includes("xịn nhất") || rawText.includes("sang nhất")) orderByConfig = { priceOriginal: "desc" };
    });

    // =====================================================================
    //  TẠO CHUỖI NHẬN DIỆN CHO BOT HIỂU ĐANG LỌC GÌ
    // =====================================================================
    const activeFilters = [];
    if (buildWhere.location) activeFilters.push(`Khu vực: ${buildWhere.location}`);
    if (buildWhere.seats) activeFilters.push(`Số chỗ: ${buildWhere.seats}`);
    
    // Đọc filter phủ định cho Bot hiểu
    if (buildWhere.fuel) {
      if (buildWhere.fuel.not) activeFilters.push(`Động cơ: TUYỆT ĐỐI KHÔNG DÙNG ${buildWhere.fuel.not}`);
      else activeFilters.push(`Động cơ: ${buildWhere.fuel}`);
    }
    
    if (buildWhere.transmission) activeFilters.push(`Hộp số: ${buildWhere.transmission}`);
    if (buildWhere.brand) activeFilters.push(`Hãng: ${buildWhere.brand}`);
    
    const botUnderstoodFilters = activeFilters.length > 0 ? activeFilters.join(", ") : "Chưa có điều kiện lọc cụ thể";

    // =====================================================================
    // KÉO DỮ LIỆU TỪ DATABASE
    // =====================================================================
    const availableCars = await prisma.car.findMany({
      where: buildWhere,
      take: 30, 
      orderBy: orderByConfig,
      select: { 
        id: true, // <--- ĐÃ BỔ SUNG: Bắt buộc lấy ID để phục vụ nút đặt xe
        name: true, brand: true, category: true, seats: true, location: true, 
        priceOriginal: true, priceDiscount: true, transmission: true, fuel: true,
        amenities: true, deliveryFee: true, requirements: true, rules: true
      }
    });

    const carListData = availableCars.map((c: any) => {
      const trans = c.transmission === "Automatic" ? "Số tự động" : "Số sàn";
      const fuel = c.fuel === "Electric" ? "Điện" : c.fuel === "Gasoline" ? "Xăng" : "Dầu";
      const currentPrice = c.priceDiscount > 0 ? c.priceDiscount : c.priceOriginal;
      
      return `📌 [${c.brand} ${c.name} - ${c.category}]
- Mã ID xe: ${c.id}
- Thông số: ${c.seats} chỗ, ${trans}, Máy ${fuel}.
- Vị trí: ${c.location}.
- Giá thuê: ${currentPrice} VNĐ/ngày.
- Phí giao xe: ${c.deliveryFee > 0 ? c.deliveryFee + ' VNĐ' : 'Miễn phí'}.
- Tiện ích: ${c.amenities.length > 0 ? c.amenities.join(", ") : 'Cơ bản'}.`;
    }).join("\n\n");

    // =====================================================================
    // NẠP CẨM NANG VÀ ÉP BOT PHẢI TƯ VẤN SÂU SÁT
    // =====================================================================
    const systemPrompt = `
      Bạn là chuyên viên CSKH ảo xuất sắc của hệ thống thuê xe ViVuCar (AutoHub AI). Luôn xưng "em" và gọi khách là "anh/chị".

      HỆ THỐNG ĐÃ LỌC VÀ HIỂU NHU CẦU HIỆN TẠI CỦA KHÁCH LÀ: 
      [ ${botUnderstoodFilters} ]

      DANH SÁCH CÁC XE KHỚP VỚI YÊU CẦU TRÊN ĐANG CÓ TRONG HỆ THỐNG:
      ${carListData ? carListData : "TRỐNG"}

      --- BÍ QUYẾT TƯ VẤN (BẮT BUỘC TUÂN THỦ 100%) ---
      1. NẾU DANH SÁCH "TRỐNG": 
         Bạn BẮT BUỘC phải báo hết xe dựa trên bộ lọc đã nhận diện. KHÔNG TỰ BỊA RA XE KHÁC NẰM NGOÀI DANH SÁCH.
      2. THẤU HIỂU KHÁCH HÀNG ĐỔI Ý: Nếu khách nói không thích một loại xe nào đó (ví dụ không thích xe điện), hãy nói: "Dạ vâng, em đã loại bỏ xe điện ra khỏi danh sách. Đây là các mẫu xe chạy xăng/dầu cực kỳ phù hợp cho nhà mình ạ...".
      3. ĐỐI CHIẾU NGÂN SÁCH: Nếu khách có yêu cầu khoảng giá (VD: 1-2 triệu), tự động nhìn "Giá thuê" để loại bỏ xe đắt tiền.
      4. KÍCH HOẠT NÚT ĐẶT XE (QUAN TRỌNG): Nếu khách hàng chốt, đồng ý thuê, hoặc yêu cầu đặt một chiếc xe cụ thể trong danh sách, hãy tư vấn nhiệt tình và BẮT BUỘC phải chèn thêm chuỗi [BOOK_BUTTON:Mã_ID_xe] ở ngay dòng cuối cùng của câu trả lời (thay Mã_ID_xe bằng ID thực tế của chiếc xe đó). 
         Ví dụ: "Dạ vâng, em đã kiểm tra và thấy chiếc Mazda 3 này rất phù hợp. Anh/chị bấm vào nút bên dưới để tiến hành thanh toán giữ xe nhé! [BOOK_BUTTON:id_cua_chiec_mazda]"
    `;
    
    const recentMessages = messages.slice(-6).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content
    }));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.35, 
      max_tokens: 1024,
    });

    return NextResponse.json({ reply: chatCompletion.choices[0]?.message?.content });

  } catch (error: any) {
    console.error("❌ LỖI CHATBOT GROQ:", error.message);
    return NextResponse.json({ error: "Hệ thống đang bảo trì, anh/chị vui lòng thử lại sau nhé!" }, { status: 500 });
  }
}
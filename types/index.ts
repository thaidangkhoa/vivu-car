// types/index.ts
export interface Car {
  id: number;
  name: string;
  location: string;
  priceOriginal: number;
  priceDiscount: number;
  image: string;
  transmission: string; // Số tự động / Số sàn
  fuel: string;         // Xăng / Dầu / Điện
  seats: number;
}
// Thêm mới
export interface Brand {
  id: number;
  name: string;
  logo: string; // Đường dẫn ảnh logo
}

export interface Location {
  id: number;
  name: string;
  value: string; // <-- Phải có dòng này
  carCount: number;
  image: string; // Số lượng xe đang có
}
export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}
export interface Review {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number; // Số sao (ví dụ: 5)
  content: string;
}

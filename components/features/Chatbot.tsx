"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Bot, User } from "lucide-react";
import Link from "next/link"; // ĐÃ BỔ SUNG: Import Link của Next.js để chuyển trang

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Dạ em chào anh/chị! Em là tư vấn viên của ViVuCar. Anh/chị đang muốn tìm xe mấy chỗ hay ở khu vực nào ạ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi anh/chị, hệ thống đang quá tải. Vui lòng thử lại sau ạ!" }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Lỗi kết nối mạng. Anh/chị vui lòng kiểm tra lại nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ĐÃ BỔ SUNG: Hàm xử lý bóc tách nội dung tin nhắn và ID xe
  const renderMessageContent = (msg: { role: string; content: string }) => {
    if (msg.role === "user") {
      return <>{msg.content}</>;
    }

    // Regex tìm thẻ [BOOK_BUTTON:id_xe]
    const buttonRegex = /\[BOOK_BUTTON:(.+?)\]/;
    const match = msg.content.match(buttonRegex);
    
    // Xóa bỏ đoạn tag khỏi text hiển thị
    const cleanText = msg.content.replace(buttonRegex, "").trim();
    const carId = match ? match[1] : null;

    return (
      <div className="flex flex-col gap-2">
        <span>{cleanText}</span>
        
        {/* Nút bấm Đặt xe hiển thị tự động khi có carId */}
        {carId && (
          <div className="mt-2 pt-2 border-t border-gray-200/60 flex justify-start">
            <Link 
              href={`/cars/${carId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <MessageSquare size={14} />
              Tiến hành đặt chiếc xe này
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed bottom-6 z-[999] font-sans transition-all duration-300 ${isOpen ? "right-24" : "right-6"}`}>
      
      {/* Khung chat */}
      {isOpen && (
        <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 mb-4 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-black italic uppercase text-sm leading-none">AutoHub AI</h3>
                <p className="text-[10px] text-blue-200">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Vùng chứa tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                {/* ĐÃ SỬA: Gọi hàm renderMessageContent thay vì in trực tiếp msg.content */}
                <div className={`px-4 py-2.5 text-sm rounded-2xl max-w-[80%] whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"}`}>
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 flex-row">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Bot size={16} /></div>
                <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm flex items-center gap-2"><Loader2 size={16} className="animate-spin text-gray-400" /> <span className="text-xs text-gray-400 italic">Đang nhập...</span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập tin nhắn */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Nhập câu hỏi của bạn..." 
              className="flex-1 bg-gray-100 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* Nút bong bóng nổi */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200 hover:scale-110 transition-transform relative group"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
          </span>
        </button>
      )}
      
    </div>
  );
}
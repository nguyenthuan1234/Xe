"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import {
  startConversation,
  fetchMessages,
  sendMessage,
  type ApiMessage,
} from "@/lib/api-chat";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function ChatModal({
  carId,
  onClose,
}: {
  carId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startConversation(carId)
      .then((c) => setConversationId(c._id))
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Không thể bắt đầu trò chuyện.",
        ),
      )
      .finally(() => setLoading(false));
  }, [carId]);

  useEffect(() => {
    if (!conversationId) return;
    const load = () =>
      fetchMessages(conversationId)
        .then(setMessages)
        .catch(() => undefined);
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !conversationId) return;
    const content = text.trim();
    setText("");
    try {
      const msg = await sendMessage(conversationId, content);
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gửi tin nhắn thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl h-[80vh] sm:h-[600px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-sm">
            Chat với người bán
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <p className="text-center text-xs text-slate-400 mt-10">
              Đang tải...
            </p>
          ) : error ? (
            <p className="text-center text-xs text-red-500 mt-10">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-slate-400 mt-10">
              Chưa có tin nhắn nào. Gửi lời chào nhé!
            </p>
          ) : (
            messages.map((m) => {
              const isMine = m.sender === user?._id;
              return (
                <div
                  key={m._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                      isMine
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-slate-100 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { Spinner, ErrorNotice } from "@/components/ui";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  type ApiConversation,
  type ApiMessage,
} from "@/lib/api-chat";
import { ApiError } from "@/lib/api";
import { formatVND, formatRelativeTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";

function otherParty(conv: ApiConversation, myId: string) {
  const buyer = typeof conv.buyer === "string" ? null : conv.buyer;
  const seller = typeof conv.seller === "string" ? null : conv.seller;
  const buyerId = typeof conv.buyer === "string" ? conv.buyer : conv.buyer._id;
  return buyerId === myId ? seller : buyer;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
      setListError("");
      setActiveId(
        (current) => current ?? (data.length > 0 ? data[0]._id : null),
      );
    } catch (err) {
      setListError(
        err instanceof ApiError
          ? err.message
          : "Không tải được danh sách trò chuyện.",
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [user, loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    const load = () =>
      fetchMessages(activeId)
        .then(setMessages)
        .catch(() => undefined);
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeId) return;
    const content = text.trim();
    setText("");
    try {
      const msg = await sendMessage(activeId, content);
      setMessages((prev) => [...prev, msg]);
      loadConversations();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gửi tin nhắn thất bại.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24">
          <Spinner />
        </div>
      </div>
    );
  }

  const activeConversation =
    conversations.find((c) => c._id === activeId) || null;
  const activeOther = activeConversation
    ? otherParty(activeConversation, user._id)
    : null;
  const activeCar =
    activeConversation && typeof activeConversation.car !== "string"
      ? activeConversation.car
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <h1 className="text-2xl font-black text-slate-900 mb-6">Tin nhắn</h1>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[600px]">
          {/* Danh sách cuộc trò chuyện */}
          <div className="border-r border-slate-100 overflow-y-auto">
            {loadingList ? (
              <Spinner />
            ) : listError ? (
              <div className="p-4">
                <ErrorNotice message={listError} onRetry={loadConversations} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Chưa có cuộc trò chuyện nào. Vào 1 tin xe và bấm &quot;Chat với
                người bán&quot; để bắt đầu.
              </div>
            ) : (
              conversations.map((conv) => {
                const other = otherParty(conv, user._id);
                const car = typeof conv.car !== "string" ? conv.car : null;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveId(conv._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      activeId === conv._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-black text-white text-sm flex-shrink-0">
                      {other?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {other?.name || "Người dùng"}
                      </p>
                      {car && (
                        <p className="text-xs text-slate-500 truncate">
                          {car.name}
                        </p>
                      )}
                      {conv.lastMessage && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Khung chat */}
          <div className="flex flex-col">
            {!activeConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <MessageCircle size={40} />
                <p className="text-sm mt-2">
                  Chọn 1 cuộc trò chuyện để bắt đầu
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-black text-white text-xs">
                    {activeOther?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {activeOther?.name || "Người dùng"}
                    </p>
                    {activeCar && (
                      <p className="text-xs text-slate-500 truncate">
                        {activeCar.name} · {formatVND(activeCar.price)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {messages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 mt-10">
                      Chưa có tin nhắn nào.
                    </p>
                  ) : (
                    messages.map((m) => {
                      const isMine = m.sender === user._id;
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm ${
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

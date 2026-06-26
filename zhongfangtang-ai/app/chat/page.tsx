"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "您好！我是中芳堂 AI 智能客服 🌸\n\n可以为您解答中医养生、芳香疗法、精油配伍、体质调理等方面的问题。\n\n请问有什么可以帮您的？",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        throw new Error(data.error || "回复失败");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "抱歉，服务暂时不可用，请稍后再试。也可拨打中芳堂电话咨询。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const quickQuestions = [
    "中医体质怎么辨识？",
    "精油养生适合什么人群？",
    "中芳堂有哪些服务？",
  ];

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-lg">
      {/* 顶栏 */}
      <header className="flex items-center justify-between px-5 py-4 bg-brand-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
            🌸
          </div>
          <div>
            <h1 className="text-lg font-semibold">中芳堂 AI 客服</h1>
            <p className="text-xs text-white/80">在线 · 中医养生专家</p>
          </div>
        </div>
        <a
          href="/admin"
          className="text-xs text-white/70 hover:text-white underline"
        >
          管理后台
        </a>
      </header>

      {/* 消息区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} msg-enter`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
              <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
            </div>
          </div>
        )}

        {/* 快捷问题 */}
        {messages.length <= 1 && !loading && (
          <div className="pt-4 space-y-2">
            <p className="text-xs text-gray-400 text-center">快捷提问</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 text-sm text-brand-600 bg-brand-50 rounded-full hover:bg-brand-100 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t px-5 py-3 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            rows={1}
            className="flex-1 px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            发送
          </button>
        </div>
        <p className="text-xs text-gray-300 text-center mt-2">
          AI 回复仅供参考，具体建议请到店咨询专业医师
        </p>
      </div>
    </div>
  );
}

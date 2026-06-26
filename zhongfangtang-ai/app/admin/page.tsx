"use client";

import { useState, useEffect } from "react";

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
};

type Tab = "knowledge" | "video" | "conversations";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("knowledge");

  // 知识库
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("通用");
  const [loadingKn, setLoadingKn] = useState(false);

  // 视频生成
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [script, setScript] = useState("");
  const [loadingVid, setLoadingVid] = useState(false);

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("admin_auth", password);
    } else {
      alert("密码错误");
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved) {
      setAuthed(true);
      setPassword(saved);
    }
  }, []);

  useEffect(() => {
    if (authed) loadKnowledge();
  }, [authed]);

  async function loadKnowledge() {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    if (data.data) setKnowledge(data.data);
  }

  async function addKnowledge() {
    if (!newTitle.trim() || !newContent.trim()) return;
    setLoadingKn(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setNewTitle("");
        setNewContent("");
        loadKnowledge();
        alert("添加成功！");
      } else {
        alert(data.error || "添加失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setLoadingKn(false);
    }
  }

  async function deleteKnowledge(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/knowledge?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${password}` },
    });
    loadKnowledge();
  }

  async function generateScript() {
    if (!topic.trim()) return;
    setLoadingVid(true);
    setScript("");
    try {
      const kw = keywords
        .split(/[,，、]/)
        .map((k) => k.trim())
        .filter(Boolean);
      const res = await fetch("/api/douyin/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ topic, keywords: kw, action: "generate" }),
      });
      const data = await res.json();
      if (data.script) {
        setScript(data.script);
      } else {
        alert(data.error || "生成失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setLoadingVid(false);
    }
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-gray-800">中芳堂管理后台</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="输入管理密码"
            className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={login}
            className="w-full mt-4 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
          >
            登录
          </button>
          <a href="/chat" className="block text-center text-sm text-gray-400 mt-4 hover:text-gray-600">
            ← 返回客服
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <header className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌸</span>
          <h1 className="text-lg font-semibold">中芳堂管理后台</h1>
        </div>
        <a href="/chat" className="text-sm text-white/80 hover:text-white">
          ← 返回客服
        </a>
      </header>

      {/* Tab 切换 */}
      <div className="flex gap-1 px-6 pt-4 border-b">
        {([
          ["knowledge", "📚 知识库"],
          ["video", "🎬 视频生成"],
          ["conversations", "💬 对话记录"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* 知识库管理 */}
        {tab === "knowledge" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-base font-semibold mb-4">添加知识</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="标题"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="分类"
                    className="w-32 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="知识内容..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                />
                <button
                  onClick={addKnowledge}
                  disabled={loadingKn}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-40"
                >
                  {loadingKn ? "添加中..." : "添加知识"}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-base font-semibold mb-4">
                知识列表 ({knowledge.length})
              </h2>
              {knowledge.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  暂无知识，请先添加
                </p>
              ) : (
                <div className="space-y-3">
                  {knowledge.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded">
                            {item.category}
                          </span>
                          <h3 className="text-sm font-medium truncate">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteKnowledge(item.id)}
                        className="text-xs text-red-400 hover:text-red-600 ml-3"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 视频生成 */}
        {tab === "video" && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-semibold mb-4">AI 短视频脚本生成</h2>
            <div className="space-y-3">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="视频主题，如：中医芳香疗法入门"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="关键词（逗号分隔），如：精油,养生,体质"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={generateScript}
                disabled={loadingVid || !topic.trim()}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-40"
              >
                {loadingVid ? "生成中..." : "生成脚本"}
              </button>

              {script && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">生成的脚本：</h3>
                  <pre className="text-sm whitespace-pre-wrap text-gray-700">
                    {script}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(script)}
                    className="mt-3 text-xs text-brand-600 hover:underline"
                  >
                    📋 复制脚本
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              💡 脚本生成后，可粘贴到数字人平台生成视频，再通过抖音 API 发布
            </p>
          </div>
        )}

        {/* 对话记录 */}
        {tab === "conversations" && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-semibold mb-4">对话记录</h2>
            <p className="text-sm text-gray-400 text-center py-8">
              对话记录将在客服使用后自动显示
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { ragChat } from "@/lib/rag";

/**
 * AI 对话 API
 * POST /api/chat
 * Body: { message: string, history?: [{role, content}] }
 */
export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    const reply = await ragChat(message, history || []);

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("对话失败:", error);
    return NextResponse.json(
      { error: "服务暂时不可用，请稍后再试" },
      { status: 500 }
    );
  }
}

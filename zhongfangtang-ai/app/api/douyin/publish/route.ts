import { NextRequest, NextResponse } from "next/server";
import { generateVideoScript } from "@/lib/deepseek";

/**
 * 抖音视频发布 API
 * POST /api/douyin/publish
 * Body: { topic: string, keywords?: string[] }
 *
 * 流程：
 * 1. AI 生成短视频脚本
 * 2. （待数字人模块接入后）生成视频
 * 3. 通过抖音官方 API 上传并发布
 */

function checkAuth(request: NextRequest) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { topic, keywords, action } = await request.json();

    // action=generate → 仅生成脚本
    // action=publish  → 生成脚本+发布（需数字人+抖音API就绪）
    const actionType = action || "generate";

    if (actionType === "generate") {
      const script = await generateVideoScript(topic, keywords);
      return NextResponse.json({
        topic,
        script,
        message: "脚本生成成功，数字人视频生成功能待素材就绪后启用",
      });
    }

    if (actionType === "publish") {
      // TODO: 数字人就绪后，这里调用 DUIX 生成视频 → 抖音 API 发布
      const script = await generateVideoScript(topic, keywords);

      // 抖音 API 发布（需 access_token，从数据库获取）
      // const publishResult = await publishToDouyin(...)

      return NextResponse.json({
        topic,
        script,
        message: "脚本已生成。视频发布功能待抖音 API 凭证配置后启用",
      });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (error) {
    console.error("视频发布失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

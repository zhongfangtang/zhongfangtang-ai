import { NextRequest, NextResponse } from "next/server";

/**
 * 抖音 OAuth 回调
 * GET /api/douyin/callback?code=xxx
 * 用授权码换取 access_token，存入数据库
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "缺少授权码" }, { status: 400 });
  }

  const clientKey = process.env.DOUYIN_CLIENT_KEY!;
  const clientSecret = process.env.DOUYIN_CLIENT_SECRET!;

  const tokenResponse = await fetch(
    "https://open.douyin.com/oauth/access_token/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.data?.access_token) {
    // 存入 Supabase（简化版，直接返回）
    return NextResponse.json({
      message: "授权成功",
      open_id: tokenData.data.open_id,
      access_token: tokenData.data.access_token,
      expires_in: tokenData.data.expires_in,
    });
  }

  return NextResponse.json(
    { error: "授权失败", detail: tokenData },
    { status: 400 }
  );
}

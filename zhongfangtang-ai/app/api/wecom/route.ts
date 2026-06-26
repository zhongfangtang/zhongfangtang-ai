import { NextRequest, NextResponse } from "next/server";
import { ragChat } from "@/lib/rag";
import crypto from "crypto";

/**
 * 企业微信回调 API
 * GET  /api/wecom → URL 验证（企微后台配置回调时验证）
 * POST /api/wecom → 接收客户消息，调用 AI 回复
 */

// 企微消息加解密（简化版，生产环境建议用完整 WXBizMsgCrypt）
function verifySignature(
  token: string,
  timestamp: string,
  nonce: string,
  echostr: string
) {
  const arr = [token, timestamp, nonce].sort();
  const sha1 = crypto.createHash("sha1").update(arr.join("")).digest("hex");
  return sha1;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msgSignature = searchParams.get("msg_signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const echostr = searchParams.get("echostr") || "";

  const token = process.env.WECOM_TOKEN || "";
  const expected = verifySignature(token, timestamp, nonce, echostr);

  if (expected === msgSignature) {
    return new NextResponse(echostr, { status: 200 });
  }

  return NextResponse.json({ error: "验证失败" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // 解析 XML（简化版，企微消息为 XML 格式）
    const contentMatch = body.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/);
    const fromUserMatch = body.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/);
    const toUserMatch = body.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/);

    const userMessage = contentMatch?.[1] || "";
    const fromUser = fromUserMatch?.[1] || "";
    const toUser = toUserMatch?.[1] || "";

    if (!userMessage) {
      return new NextResponse("success", { status: 200 });
    }

    // 调用 AI 对话
    const reply = await ragChat(userMessage);

    // 构造企微回复 XML
    const replyXml = `<xml>
  <ToUserName><![CDATA[${fromUser}]]></ToUserName>
  <FromUserName><![CDATA[${toUser}]]></FromUserName>
  <CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${reply}]]></Content>
</xml>`;

    return new NextResponse(replyXml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("企微回调处理失败:", error);
    return new NextResponse("success", { status: 200 });
  }
}

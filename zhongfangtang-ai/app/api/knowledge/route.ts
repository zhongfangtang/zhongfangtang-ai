import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addKnowledge } from "@/lib/rag";

/**
 * 知识库管理 API
 * GET  /api/knowledge       → 列表
 * POST /api/knowledge       → 新增
 * DELETE /api/knowledge?id= → 删除
 */

// 简易鉴权
function checkAuth(request: NextRequest) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabaseAdmin
    .from("knowledge_base")
    .select("id, title, content, category, created_at")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    const knowledge = await addKnowledge(
      title,
      content,
      category || "通用"
    );

    return NextResponse.json({ data: knowledge, message: "知识添加成功" });
  } catch (error) {
    console.error("添加知识失败:", error);
    return NextResponse.json(
      { error: "添加失败，请检查 API 配置" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("knowledge_base")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "删除成功" });
}

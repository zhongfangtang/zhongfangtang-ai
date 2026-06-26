import { supabaseAdmin } from "./supabase";
import { generateEmbedding, chatCompletion } from "./deepseek";

/**
 * RAG 检索增强生成
 * 1. 将用户问题转为向量
 * 2. 在 Supabase pgvector 中检索相关知识
 * 3. 将知识注入 prompt，调用 DeepSeek 生成回复
 */

const SYSTEM_PROMPT = `你是「中芳堂」美业的 AI 智能客服，专注于中医养生、芳香疗法、植物精油、体质辨识领域。

你的职责：
1. 回答客户关于中医养生、精油配伍、体质调理的问题
2. 介绍中芳堂的产品和服务
3. 提供专业的养生建议
4. 引导客户到店体验

回答要求：
- 语气亲切温暖，称呼客户为"您"
- 回答简洁明了，避免过长
- 如果不确定，诚实告知并建议到店咨询
- 涉及医疗诊断时，提醒客户咨询专业医师`;

/**
 * 检索相关知识
 */
async function retrieveKnowledge(query: string, topK: number = 3) {
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc("match_knowledge", {
    query_embedding: queryEmbedding,
    match_count: topK,
  });

  if (error) {
    console.error("知识库检索失败:", error);
    return [];
  }

  return (data || []) as { title: string; content: string; category: string }[];
}

/**
 * RAG 对话
 */
export async function ragChat(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
) {
  // 1. 检索相关知识
  const knowledge = await retrieveKnowledge(userMessage);

  // 2. 构建带知识上下文的消息
  const knowledgeContext = knowledge.length
    ? knowledge
        .map((k) => `【${k.title}】\n${k.content}`)
        .join("\n\n---\n\n")
    : "";

  const systemContent = knowledgeContext
    ? `${SYSTEM_PROMPT}\n\n以下是相关知识库内容，请参考回答：\n\n${knowledgeContext}`
    : SYSTEM_PROMPT;

  // 3. 调用 DeepSeek 生成回复
  const messages = [
    { role: "system" as const, content: systemContent },
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const reply = await chatCompletion(messages, { temperature: 0.6 });

  // 4. 保存对话记录
  await supabaseAdmin.from("conversations").insert([
    { role: "user", content: userMessage },
    { role: "assistant", content: reply },
  ]);

  return reply;
}

/**
 * 添加知识到知识库
 */
export async function addKnowledge(
  title: string,
  content: string,
  category: string
) {
  const embedding = await generateEmbedding(`${title}\n${content}`);

  const { data, error } = await supabaseAdmin
    .from("knowledge_base")
    .insert([{ title, content, category, embedding }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

import OpenAI from "openai";

/**
 * DeepSeek API 封装
 * 兼容 OpenAI API 格式，可直接使用 openai SDK
 * 延迟初始化，避免构建时因缺少环境变量报错
 */

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY 环境变量未配置");
    }
    _client = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    });
  }
  return _client;
}

/**
 * 对话补全
 */
export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
) {
  const response = await getClient().chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
  });
  return response.choices[0]?.message?.content || "";
}

/**
 * 生成嵌入向量（用于 RAG 检索）
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: "deepseek-embedding",
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * 生成短视频脚本
 */
export async function generateVideoScript(topic: string, keywords?: string[]) {
  const systemPrompt = `你是中芳堂美业的短视频脚本策划师，擅长中医养生、芳香疗法、精准养生领域。
请根据主题生成一个 60 秒短视频脚本，包含：
1. 开场钩子（5秒）
2. 核心内容（45秒）
3. 引导关注（10秒）

格式要求：
- 口语化表达，适合数字人播报
- 每段标注预计时长
- 包含建议的字幕关键词`;

  const userPrompt = `主题：${topic}
${keywords ? `关键词：${keywords.join("、")}` : ""}

请生成短视频脚本。`;

  return chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.8, maxTokens: 1500 }
  );
}

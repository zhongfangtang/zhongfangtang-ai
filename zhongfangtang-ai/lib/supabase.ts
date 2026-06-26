import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 服务端 Supabase 客户端（延迟初始化）
 * 使用 service_role key，绕过 RLS，所有操作通过 API Route 中转
 */
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    // 优先用 service_role，兼容新格式 sb_secret_ 和旧版 JWT
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase 环境变量未配置");
    }
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

/** 统一导出，所有 API Route 用这个 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});

/** 前端客户端（本项目中 admin 用密码认证，不直接用 Supabase Auth） */
export function createBrowserClient() {
  return getClient();
}

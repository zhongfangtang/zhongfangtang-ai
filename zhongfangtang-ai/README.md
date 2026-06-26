# 中芳堂 AI 智能体 — 部署指南

> 月费 0 元 | Vercel + Supabase + DeepSeek | 公网直接访问

---

## 架构总览

```
用户 → Vercel (Next.js) ← 公网直接访问
         ├── /chat        AI 客服聊天
         ├── /admin       管理后台
         └── /api/*       后端 API
               ↓
         Supabase (免费)  数据库 + 向量检索
               ↓
         DeepSeek API     AI 大模型
```

---

## 部署步骤（约 30 分钟）

### 第 1 步：创建 Supabase 项目（10 分钟）

1. 访问 https://supabase.com 注册（可用 GitHub 登录）
2. 点击「New Project」
3. 项目名：`zhongfangtang-ai`
4. 数据库密码：自行设置并记好
5. 区域选：Southeast Asia (Singapore)
6. 等待项目创建完成

### 第 2 步：初始化数据库（2 分钟）

1. 进入 Supabase Dashboard → SQL Editor
2. 复制 `supabase/schema.sql` 全部内容
3. 粘贴并执行
4. 确认显示 "Success"

### 第 3 步：获取 Supabase 密钥（1 分钟）

进入 Settings → API，获取：
- `Project URL` → SUPABASE_URL
- `anon public` key → SUPABASE_ANON_KEY
- `service_role` key → SUPABASE_SERVICE_ROLE_KEY

### 第 4 步：获取 DeepSeek API Key（3 分钟）

1. 访问 https://platform.deepseek.com 注册
2. 进入 API Keys → 创建 Key
3. 复制 Key 保存

### 第 5 步：上传 GitHub（5 分钟）

```bash
cd zhongfangtang-ai
git init
git add .
git commit -m "中芳堂 AI 智能体 v1.0"
git branch -M main
git remote add origin https://github.com/你的用户名/zhongfangtang-ai.git
git push -u origin main
```

### 第 6 步：Vercel 部署（5 分钟）

1. 访问 https://vercel.com 注册（用 GitHub 登录）
2. 点击「New Project」→ 选择 `zhongfangtang-ai` 仓库
3. Framework Preset 自动识别为 Next.js
4. **Environment Variables** 逐个添加：

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | 你的 Supabase Project URL |
| `SUPABASE_ANON_KEY` | 你的 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 service_role key |
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com/v1` |
| `ADMIN_PASSWORD` | `zhongfangtang2025` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同 anon key |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | `zhongfangtang2025` |

5. 点击「Deploy」
6. 等待 2-3 分钟构建完成

### 第 7 步：验证

部署完成后，Vercel 会给你一个域名，如：
`https://zhongfangtang-ai.vercel.app`

- 访问 `https://你的域名/chat` → AI 客服界面
- 访问 `https://你的域名/admin` → 管理后台（密码：zhongfangtang2025）

---

## 企业微信接入

### 配置回调地址

1. 登录企业微信管理后台 → 应用管理 → 自建应用
2. 接收消息 → 设置 API 接收
3. URL 填写：`https://你的域名.vercel.app/api/wecom`
4. Token 和 EncodingAESKey 自行生成
5. 将 Token 填入 Vercel 环境变量 `WECOM_TOKEN`
6. 将 AESKey 填入 `WECOM_AES_KEY`
7. CorpID 填入 `WECOM_CORP_ID`
8. AgentId 填入 `WECOM_AGENT_ID`
9. Secret 填入 `WECOM_SECRET`
10. 重新部署 Vercel

---

## 抖音 API 接入

1. 访问 https://open.douyin.com 注册开发者
2. 创建网站应用 → 获取 `client_key` 和 `client_secret`
3. 填入 Vercel 环境变量 `DOUYIN_CLIENT_KEY` 和 `DOUYIN_CLIENT_SECRET`
4. OAuth 回调地址：`https://你的域名.vercel.app/api/douyin/callback`

---

## 月费对比

| 项目 | 旧方案（自部署） | 新方案（免费平台） |
|------|------------------|-------------------|
| 服务器 | 150 元/月 | 0 元（Vercel 免费） |
| 数据库 | 含在服务器 | 0 元（Supabase 免费） |
| 大模型 | 0 元 | 0 元（DeepSeek 免费额度） |
| **合计** | **150 元/月** | **0 元/月** |

---

## 免费额度

| 平台 | 免费额度 | 预估用量 | 是否够用 |
|------|----------|----------|----------|
| Vercel Hobby | 100GB 带宽 + 10万次函数/月 | <1万次 | ✅ |
| Supabase Free | 500MB 数据库 + 5万月活 | <1000 | ✅ |
| DeepSeek API | 限时免费额度 | <5000次 | ✅ |

---

## 文件结构

```
zhongfangtang-ai/
├── app/
│   ├── layout.tsx           # 全局布局
│   ├── page.tsx             # 首页（重定向到 /chat）
│   ├── globals.css          # 全局样式
│   ├── chat/page.tsx        # AI 客服聊天界面
│   ├── admin/page.tsx       # 管理后台
│   └── api/
│       ├── chat/route.ts        # AI 对话 API（RAG）
│       ├── knowledge/route.ts   # 知识库管理 API
│       ├── wecom/route.ts       # 企业微信回调 API
│       └── douyin/
│           ├── callback/route.ts  # 抖音 OAuth 回调
│           └── publish/route.ts   # 视频脚本生成+发布
├── lib/
│   ├── supabase.ts          # Supabase 客户端
│   ├── deepseek.ts          # DeepSeek API 封装
│   └── rag.ts               # RAG 检索增强生成
├── supabase/
│   └── schema.sql           # 数据库建表 SQL
├── .env.example             # 环境变量模板
├── .gitignore
├── next.config.js
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json              # Vercel 配置
└── README.md                # 本文件
```

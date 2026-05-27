# Travel Copilot ✈️🌍

> **不替你安排满每一分钟，只在关键时刻帮你做出更好的选择。**

AI 驱动的旅行规划助手。通过性格测试了解你的旅行风格，用对话的方式帮你生成个性化的行程建议。

## 在线体验

🔗 **https://travel-copilot.pages.dev**

> 微信内打开会看到「请在浏览器中打开」提示页 —— 这是设计行为，请复制链接到手机浏览器中使用。

---

## 产品亮点

| 功能 | 说明 |
|------|------|
| 🎭 性格测试 | 6 道趣味选择题，识别你是「效率型」「探索型」还是「佛系型」旅行者 |
| 💬 AI 对话 | 基于 DeepSeek 大模型，根据你的性格+目的地生成建议 |
| 🗺️ 地图可视化 | 高德地图集成，推荐景点直接在地图上展示 |
| 🐾 旅行伙伴 | 浮动小宠物，陪你完成整个规划流程 |
| 📱 移动端优先 | 响应式设计，触控友好，支持 iOS/Android 浏览器 |

---

## 技术架构

```
┌─────────────────────────────────────────────┐
│              Cloudflare Pages                │
├─────────────────────────────────────────────┤
│  Edge Middleware (_middleware.js)            │
│  ├── 微信 UA → 返回引导页 (无 JS 依赖)     │
│  └── 其他浏览器 → 正常加载 SPA             │
├─────────────────────────────────────────────┤
│  Static Assets (Next.js Export)             │
│  └── React SPA + Tailwind CSS              │
├─────────────────────────────────────────────┤
│  Pages Functions                            │
│  └── /api/chat → DeepSeek API 代理         │
└─────────────────────────────────────────────┘
```

### 关键技术决策

1. **静态导出 + Edge Functions**：Next.js `output: 'export'` 生成纯静态文件，API 路由通过 Cloudflare Pages Functions 实现，避免了需要 Node.js 运行时的限制。

2. **微信兼容方案**：微信内置浏览器对 `pages.dev` 等共享域名存在网络限制。采用 Cloudflare Edge Middleware 在服务端检测 User-Agent，直接返回极简 HTML 引导页（1KB，零外部依赖），引导用户跳转外部浏览器。

3. **SSR 白屏防护**：framer-motion 的 `initial={{ opacity: 0 }}` 会在 SSR 时输出 `style="opacity:0"`。通过去除首屏动画 + 内联 CSS animation fallback + 3 秒 JS 兜底，确保即使 JS 加载失败也能显示内容。

4. **国内可访问**：部署在 Cloudflare 全球边缘网络，手机浏览器可直接访问（无需 VPN）。

---

## 本地开发

```bash
cd travel-copilot
npm install
npm run dev
```

环境变量（`.env.local`）：
```
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
GAODE_API_KEY=your-gaode-key
```

## 部署

```bash
# 构建静态导出
npx next build

# 部署到 Cloudflare Pages
npx wrangler pages deploy out --project-name travel-copilot --commit-dirty=true
```

部署后在 Cloudflare Dashboard 设置 Secrets：
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`

---

## 项目结构

```
travel-copilot/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局 + 内联关键 CSS
│   │   ├── page.tsx            # 主页面（状态管理）
│   │   └── globals.css         # 全局样式
│   └── components/
│       ├── WelcomeScreen.tsx    # 首屏欢迎页
│       ├── PersonalityTest.tsx  # 性格测试
│       ├── ChatInterface.tsx   # AI 对话界面
│       ├── ItineraryView.tsx   # 行程展示
│       ├── MapView.tsx         # 高德地图
│       └── FloatingPet.tsx     # 浮动宠物
├── functions/
│   ├── _middleware.js          # 微信 UA 拦截
│   └── api/chat.js             # DeepSeek API 代理
├── next.config.js              # output: 'export'
└── out/                        # 构建产物
```

---

## License

MIT

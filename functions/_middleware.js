// Cloudflare Pages Middleware: WeChat UA detection
// Returns a minimal guide page for WeChat users (server-side, zero JS dependency)
export async function onRequest(context) {
  const ua = context.request.headers.get('user-agent') || '';
  const url = new URL(context.request.url);

  // Only intercept HTML page requests (not API/assets)
  if (ua.toLowerCase().includes('micromessenger') && !url.pathname.startsWith('/api/') && !url.pathname.match(/\.(js|css|png|jpg|svg|ico|json|woff2?)$/)) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Travel Copilot</title>
</head>
<body style="margin:0;padding:0;min-height:100vh;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Heiti SC','Microsoft YaHei',sans-serif;color:#fff;text-align:center">
<div style="padding:40px 30px">
<div style="font-size:60px;margin-bottom:24px">🌍</div>
<div style="font-size:22px;font-weight:700;margin-bottom:20px">请在浏览器中打开</div>
<div style="font-size:15px;color:#aaa;line-height:2">
点击右上角 <span style="display:inline-block;border:1px solid #666;border-radius:4px;padding:2px 8px;margin:0 4px;font-size:13px;color:#fff">···</span> 按钮<br>选择「在默认浏览器中打开」
</div>
<div style="margin-top:50px;padding:16px 24px;border-radius:12px;background:rgba(255,255,255,0.08)">
<div style="font-size:13px;color:#888">Travel Copilot - AI旅行助手</div>
<div style="font-size:12px;color:#555;margin-top:6px">需要完整浏览器环境支持</div>
</div>
</div>
</body>
</html>`;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  }

  // Non-WeChat: pass through normally
  return await context.next();
}

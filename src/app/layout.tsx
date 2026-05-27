import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sc',
});

export const metadata: Metadata = {
  title: 'Travel Copilot',
  description: '不替你安排满每一分钟，只在关键时刻帮你做出更好的选择',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Travel Copilot',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="font-sans min-h-screen">
        {/* 内联关键 CSS：背景+布局+可见性，即使外部 CSS/JS 全部失败也能显示页面 */}
        <style dangerouslySetInnerHTML={{ __html: `
          body{background:linear-gradient(135deg,#e8f4fd 0%,#f0f7ff 30%,#eef6ff 60%,#dbeafe 100%);min-height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;color:#1e293b}
          .min-h-screen{min-height:100vh}
          .flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}
          .text-center{text-align:center}.mx-auto{margin-left:auto;margin-right:auto}
          .px-6{padding-left:1.5rem;padding-right:1.5rem}.py-12{padding-top:3rem;padding-bottom:3rem}
          .mt-8{margin-top:2rem}.mt-10{margin-top:2.5rem}.mb-2{margin-bottom:.5rem}.mb-6{margin-bottom:1.5rem}
          .text-2xl{font-size:1.5rem}.font-bold{font-weight:700}.text-sm{font-size:.875rem}
          .text-slate-800{color:#1e293b}.text-slate-500{color:#64748b}
          .w-full{width:100%}.max-w-sm{max-width:24rem}
          .rounded-2xl{border-radius:1rem}.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}
          .from-blue-500{--tw-gradient-from:#3b82f6;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,transparent)}
          .to-blue-600{--tw-gradient-to:#2563eb}
          .text-white{color:#fff}.py-3\\.5{padding-top:.875rem;padding-bottom:.875rem}
          .font-semibold{font-weight:600}
          @keyframes __fmfix{from{opacity:0}to{opacity:1;transform:none}}
          [style*="opacity:0"],[style*="opacity: 0"]{animation:__fmfix .3s 1s both!important}
        ` }} />
        {/* 内联 JS 兜底：3秒后若 React 未 hydrate，强制显示所有隐藏元素 */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.__NEXT_HYDRATED__=false;
          setTimeout(function(){
            if(!window.__NEXT_HYDRATED__){
              var els=document.querySelectorAll('[style]');
              for(var i=0;i<els.length;i++){
                if(els[i].style.opacity==='0'){
                  els[i].style.opacity='1';
                  els[i].style.transform='none';
                }
              }
            }
          },3000);
        ` }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: `[style*="opacity"]{opacity:1!important;transform:none!important}` }} />
        </noscript>
        {children}
      </body>
    </html>
  );
}

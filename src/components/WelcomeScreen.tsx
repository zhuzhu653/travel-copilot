'use client';

import { motion } from 'framer-motion';
import { Compass, MessageCircle, SlidersHorizontal, Layers, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="text-center w-full max-w-sm">
        {/* Logo - friendly blue circle */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-blue-100/60">
          <Compass className="w-8 h-8 text-blue-500" strokeWidth={1.8} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-2">
          Travel Copilot
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[280px] mx-auto">
          你的智能旅行伙伴 — 不替你安排满每一分钟，只在关键时刻帮你做出更好的选择 ✨
        </p>
      </div>

      {/* Features */}
      <div className="w-full max-w-sm mt-8 space-y-3">
        {[
          { icon: MessageCircle, label: '对话式规划', desc: '像朋友一样聊出你的旅行', color: 'from-blue-400 to-blue-500' },
          { icon: SlidersHorizontal, label: '偏好微调', desc: '五维度精准匹配你的风格', color: 'from-cyan-400 to-blue-400' },
          { icon: Layers, label: '透明决策', desc: '信息密度高，一眼看清选择', color: 'from-indigo-400 to-blue-500' },
          { icon: Zap, label: '动态调整', desc: '天气变了、想法变了，行程跟着变', color: 'from-violet-400 to-indigo-500' },
        ].map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/60 shadow-sm hover:shadow-md hover:border-blue-200/80 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <feature.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{feature.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm mt-10">
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 active:scale-[0.98]"
        >
          开始旅行 ✈️
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">
          30 秒人格测试 · 了解你的旅行风格
        </p>
      </div>
    </motion.div>
  );
}

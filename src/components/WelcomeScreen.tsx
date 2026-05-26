'use client';

import { motion } from 'framer-motion';
import { Compass, MessageCircle, SlidersHorizontal, Layers, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center w-full max-w-sm"
      >
        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-8 rounded-2xl bg-slate-950 flex items-center justify-center">
          <Compass className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight mb-2">
          Travel Copilot
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[260px] mx-auto">
          不替你安排满每一分钟，只在关键时刻帮你做出更好的选择
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-sm mt-10 space-y-3"
      >
        {[
          { icon: MessageCircle, label: '对话式规划', desc: '像朋友一样聊出你的旅行' },
          { icon: SlidersHorizontal, label: '偏好微调', desc: '五维度精准匹配你的风格' },
          { icon: Layers, label: '决策卡牌', desc: '信息密度高，一眼看清选择' },
          { icon: Zap, label: '动态调整', desc: '天气变了、想法变了，行程跟着变' },
        ].map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-4.5 h-4.5 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{feature.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full max-w-sm mt-10"
      >
        <button
          onClick={onStart}
          className="w-full bg-slate-950 hover:bg-slate-800 text-white py-3.5 rounded-xl text-sm font-medium transition-colors shadow-subtle"
        >
          开始旅行
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">
          30 秒人格测试 · 了解你的旅行风格
        </p>
      </motion.div>
    </motion.div>
  );
}

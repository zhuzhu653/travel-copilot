'use client';

import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 relative overflow-hidden"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-primary-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Glass card container */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 mb-8">
          {/* Animated compass icon */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-400 to-sky-400 flex items-center justify-center shadow-glow-blue"
          >
            <span className="text-4xl sm:text-5xl">🧭</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2 tracking-tight">
            Travel Copilot
          </h1>
          <p className="text-base sm:text-lg text-primary-600 font-medium mb-1">智旅伴侣</p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            不替你安排满每一分钟，<br />只在关键时刻帮你做出更好的选择
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: '💬', label: '对话规划', color: 'from-blue-50 to-blue-100' },
            { icon: '🎚️', label: '偏好调节', color: 'from-purple-50 to-purple-100' },
            { icon: '🃏', label: '决策卡牌', color: 'from-amber-50 to-amber-100' },
            { icon: '⚡', label: '动态调整', color: 'from-emerald-50 to-emerald-100' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-b ${feature.color} border border-white/60`}
            >
              <span className="text-xl sm:text-2xl">{feature.icon}</span>
              <span className="text-[10px] sm:text-xs text-gray-600 font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(59, 143, 242, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full bg-gradient-to-r from-primary-500 to-sky-500 text-white px-8 py-4 rounded-2xl text-base sm:text-lg font-medium shadow-lg shadow-primary-200/50 transition-all"
        >
          开始旅行 ✨
        </motion.button>

        <p className="text-xs text-gray-400 mt-4">
          先做一个30秒的旅行人格测试，让我更了解你
        </p>
      </motion.div>
    </motion.div>
  );
}

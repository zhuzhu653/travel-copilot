'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalityTestProps {
  onComplete: (personality: string) => void;
  onSkip: () => void;
}

interface Question {
  id: number;
  question: string;
  options: { label: string; emoji: string; value: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: '你到了一个陌生城市，第一件事是？',
    options: [
      { label: '找一家当地咖啡馆坐下感受氛围', emoji: '☕', value: 'atmosphere' },
      { label: '直奔地标打卡', emoji: '📸', value: 'landmark' },
      { label: '随便走走，看到什么算什么', emoji: '🚶', value: 'wander' },
      { label: '先找一家好吃的', emoji: '🍜', value: 'food' },
    ],
  },
  {
    id: 2,
    question: '旅行中突然下雨，你会？',
    options: [
      { label: '找一家书店或博物馆躲雨', emoji: '📚', value: 'culture' },
      { label: '撑伞继续走，雨中拍照更有感觉', emoji: '🌧️', value: 'adventure' },
      { label: '回酒店休息，明天再说', emoji: '🛋️', value: 'relax' },
      { label: '钻进巷子找一家有氛围的小店', emoji: '🏮', value: 'explore' },
    ],
  },
  {
    id: 3,
    question: '你更享受旅行的哪个部分？',
    options: [
      { label: '发现一个没人知道的角落', emoji: '🗺️', value: 'discover' },
      { label: '拍到一张绝美的照片', emoji: '📷', value: 'photo' },
      { label: '什么都不想，就是放空', emoji: '🌿', value: 'chill' },
      { label: '吃到一道惊艳的菜', emoji: '🍽️', value: 'taste' },
    ],
  },
];

const personalityMap: Record<string, { name: string; emoji: string; desc: string }> = {
  'atmosphere-culture-discover': { name: '氛围漫游者', emoji: '🌙', desc: '你享受城市的呼吸节奏，喜欢在不经意间发现美好' },
  'atmosphere-culture-chill': { name: '氛围漫游者', emoji: '🌙', desc: '你享受城市的呼吸节奏，喜欢在不经意间发现美好' },
  'atmosphere-explore-discover': { name: '探索者', emoji: '🧭', desc: '好奇心驱动你走进每一条未知的巷子' },
  'landmark-adventure-photo': { name: '收集者', emoji: '📸', desc: '你用镜头记录世界，每一帧都是珍藏' },
  'landmark-adventure-discover': { name: '收集者', emoji: '📸', desc: '你用镜头记录世界，每一帧都是珍藏' },
  'wander-relax-chill': { name: '漫游者', emoji: '🌊', desc: '没有目的就是最好的目的，你享受纯粹的放空' },
  'wander-explore-discover': { name: '探索者', emoji: '🧭', desc: '好奇心驱动你走进每一条未知的巷子' },
  'food-explore-taste': { name: '美食猎人', emoji: '🍜', desc: '一座城市的灵魂藏在它的厨房里' },
  'food-culture-taste': { name: '美食猎人', emoji: '🍜', desc: '一座城市的灵魂藏在它的厨房里' },
};

function getPersonality(answers: string[]): { name: string; emoji: string; desc: string } {
  const key = answers.join('-');
  if (personalityMap[key]) return personalityMap[key];

  // Fallback logic based on most common traits
  const traits = answers.join(' ');
  if (traits.includes('food') || traits.includes('taste')) {
    return { name: '美食猎人', emoji: '🍜', desc: '一座城市的灵魂藏在它的厨房里' };
  }
  if (traits.includes('photo') || traits.includes('landmark')) {
    return { name: '收集者', emoji: '📸', desc: '你用镜头记录世界，每一帧都是珍藏' };
  }
  if (traits.includes('chill') || traits.includes('relax')) {
    return { name: '漫游者', emoji: '🌊', desc: '没有目的就是最好的目的，你享受纯粹的放空' };
  }
  if (traits.includes('discover') || traits.includes('explore')) {
    return { name: '探索者', emoji: '🧭', desc: '好奇心驱动你走进每一条未知的巷子' };
  }
  return { name: '氛围漫游者', emoji: '🌙', desc: '你享受城市的呼吸节奏，喜欢在不经意间发现美好' };
}

export function PersonalityTest({ onComplete, onSkip }: PersonalityTestProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ name: string; emoji: string; desc: string } | null>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate personality
      const personality = getPersonality(newAnswers);
      setResult(personality);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6"
    >
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="font-medium">旅行人格测试</span>
            <span>{result ? '完成!' : `${currentQ + 1}/${questions.length}`}</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-400 to-sky-400 rounded-full"
              animate={{ width: result ? '100%' : `${((currentQ + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-6 sm:mb-8">
                {questions[currentQ].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQ].options.map((option, i) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 rounded-xl bg-white/70 border border-primary-100/50 hover:border-primary-300 hover:bg-primary-50/80 hover:shadow-card transition-all flex items-center gap-3 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {option.emoji}
                    </span>
                    <span className="text-gray-700 group-hover:text-navy-900 font-medium text-sm sm:text-base">
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center glass-card rounded-3xl p-8 sm:p-10"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-sky-400 flex items-center justify-center shadow-glow-blue"
              >
                <span className="text-5xl">{result.emoji}</span>
              </motion.div>
              <p className="text-sm text-primary-600 mb-2 font-medium">你的旅行人格是</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
                {result.name}
              </h2>
              <p className="text-gray-500 mb-8 text-sm sm:text-base">{result.desc}</p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onComplete(result.name)}
                className="w-full bg-gradient-to-r from-primary-500 to-sky-500 text-white px-8 py-4 rounded-2xl text-base sm:text-lg font-medium shadow-lg shadow-primary-200/50 transition-all"
              >
                开始规划旅行 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button */}
        {!result && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onSkip}
            className="mt-6 text-sm text-gray-400 hover:text-primary-600 transition-colors mx-auto block"
          >
            跳过测试，直接开始 →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

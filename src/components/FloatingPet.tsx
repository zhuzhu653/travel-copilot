'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PetConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
}

const PETS: PetConfig[] = [
  { id: 'cat', name: '喵导游', emoji: '🐱', color: 'from-amber-300 to-orange-300', bgGradient: 'from-amber-50 to-orange-50' },
  { id: 'penguin', name: '企鹅领航', emoji: '🐧', color: 'from-sky-300 to-blue-400', bgGradient: 'from-sky-50 to-blue-50' },
  { id: 'bunny', name: '兔兔向导', emoji: '🐰', color: 'from-pink-300 to-rose-300', bgGradient: 'from-pink-50 to-rose-50' },
  { id: 'fox', name: '小狐探路', emoji: '🦊', color: 'from-orange-300 to-red-300', bgGradient: 'from-orange-50 to-red-50' },
];

interface TipConfig {
  stage: string;
  tips: string[];
}

const TIPS_BY_STAGE: TipConfig[] = [
  {
    stage: 'welcome',
    tips: [
      '嗨！点击"开始旅行"就能进入性格测试啦~',
      '先做个小测试，让我了解你的旅行风格 ✨',
      '欢迎来到 Travel Copilot！我是你的向导~',
    ],
  },
  {
    stage: 'personality',
    tips: [
      '选择最接近你的答案就好，没有对错哦~',
      '这些选项会影响后面推荐的行程风格~',
      '凭直觉选就行，别想太多！',
    ],
  },
  {
    stage: 'chat',
    tips: [
      '可以试试点击下面的例句快速开始~',
      '聊两轮之后就能解锁"生成行程"按钮了',
      '点💡可以获取旅行冷知识哦',
      '试试告诉我你的预算和时间~',
      '说得越具体，行程越精准！',
    ],
  },
  {
    stage: 'itinerary',
    tips: [
      '点击"时间河流"切换另一种行程视图~',
      '有个神秘盲盒，点击揭晓惊喜！',
      '觉得行程不满意？回去聊天调整就好~',
      '每张卡片都有替代方案可以参考哦',
    ],
  },
];

interface FloatingPetProps {
  currentStage: string;
}

export function FloatingPet({ currentStage }: FloatingPetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [selectedPet, setSelectedPet] = useState<PetConfig>(PETS[0]);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [bounceCount, setBounceCount] = useState(0);

  // Auto-show tip periodically
  useEffect(() => {
    const showRandomTip = () => {
      const stageTips = TIPS_BY_STAGE.find((t) => t.stage === currentStage)?.tips || TIPS_BY_STAGE[0].tips;
      const randomTip = stageTips[Math.floor(Math.random() * stageTips.length)];
      setCurrentTip(randomTip);
      setShowTip(true);
      setTimeout(() => setShowTip(false), 5000);
    };

    // Show first tip after 3 seconds
    const initialTimer = setTimeout(showRandomTip, 3000);
    // Then every 30 seconds
    const interval = setInterval(showRandomTip, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [currentStage]);

  // Bounce animation trigger
  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setBounceCount((c) => c + 1);
    }, 8000);
    return () => clearInterval(bounceInterval);
  }, []);

  const getTip = () => {
    const stageTips = TIPS_BY_STAGE.find((t) => t.stage === currentStage)?.tips || TIPS_BY_STAGE[0].tips;
    const randomTip = stageTips[Math.floor(Math.random() * stageTips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);
    setTimeout(() => setShowTip(false), 5000);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Tip bubble */}
      <AnimatePresence>
        {showTip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full right-0 mb-3 w-52 sm:w-56"
          >
            <div className={`bg-gradient-to-br ${selectedPet.bgGradient} backdrop-blur-md rounded-2xl rounded-br-sm px-3 py-2.5 shadow-lg border border-white/60`}>
              <p className="text-xs text-navy-800 leading-relaxed">{currentTip}</p>
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-gradient-to-br from-white/80 to-primary-50 rotate-45 border-r border-b border-white/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet selector panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-full right-0 mb-3 w-60"
          >
            <div className="glass-card-strong rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-navy-900">
                  {showPetSelector ? '选择宠物' : `${selectedPet.name}的建议`}
                </h3>
                <button
                  onClick={() => setShowPetSelector(!showPetSelector)}
                  className="text-xs text-primary-500 hover:text-primary-700 transition-colors"
                >
                  {showPetSelector ? '返回' : '换一个'}
                </button>
              </div>

              {showPetSelector ? (
                <div className="grid grid-cols-2 gap-2">
                  {PETS.map((pet) => (
                    <motion.button
                      key={pet.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowPetSelector(false);
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                        selectedPet.id === pet.id
                          ? 'border-primary-300 bg-primary-50/50'
                          : 'border-white/50 bg-white/30 hover:bg-white/60'
                      }`}
                    >
                      <span className="text-2xl">{pet.emoji}</span>
                      <span className="text-[10px] text-navy-700 font-medium">{pet.name}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-navy-700 leading-relaxed bg-white/40 rounded-lg p-2.5">
                    {currentTip || '点击我获取当前页面的使用提示~'}
                  </p>
                  <button
                    onClick={getTip}
                    className="w-full text-xs bg-gradient-to-r from-primary-100 to-sky-100 hover:from-primary-200 hover:to-sky-200 text-primary-700 py-2 rounded-lg transition-all font-medium"
                  >
                    🔮 再来一条提示
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet avatar button */}
      <motion.button
        key={bounceCount}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!isOpen) {
            getTip();
          }
          setIsOpen(!isOpen);
          setShowTip(false);
        }}
        className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${selectedPet.color} shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow border-2 border-white/80`}
      >
        <span className="text-2xl">{selectedPet.emoji}</span>
        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}

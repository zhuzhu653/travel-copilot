'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Camera, Footprints, UtensilsCrossed, BookOpen, CloudRain, Sofa, Lamp, Map, Image, Leaf, ChefHat, ArrowRight, SkipForward } from 'lucide-react';

interface PersonalityTestProps {
  onComplete: (personality: string) => void;
  onSkip: () => void;
}

interface Question {
  id: number;
  question: string;
  options: { label: string; icon: typeof Coffee; value: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: '你到了一个陌生城市，第一件事是？',
    options: [
      { label: '找一家当地咖啡馆坐下感受氛围', icon: Coffee, value: 'atmosphere' },
      { label: '直奔地标打卡', icon: Camera, value: 'landmark' },
      { label: '随便走走，看到什么算什么', icon: Footprints, value: 'wander' },
      { label: '先找一家好吃的', icon: UtensilsCrossed, value: 'food' },
    ],
  },
  {
    id: 2,
    question: '旅行中突然下雨，你会？',
    options: [
      { label: '找一家书店或博物馆躲雨', icon: BookOpen, value: 'culture' },
      { label: '撑伞继续走，雨中拍照更有感觉', icon: CloudRain, value: 'adventure' },
      { label: '回酒店休息，明天再说', icon: Sofa, value: 'relax' },
      { label: '钻进巷子找一家有氛围的小店', icon: Lamp, value: 'explore' },
    ],
  },
  {
    id: 3,
    question: '你更享受旅行的哪个部分？',
    options: [
      { label: '发现一个没人知道的角落', icon: Map, value: 'discover' },
      { label: '拍到一张绝美的照片', icon: Image, value: 'photo' },
      { label: '什么都不想，就是放空', icon: Leaf, value: 'chill' },
      { label: '吃到一道惊艳的菜', icon: ChefHat, value: 'taste' },
    ],
  },
];

const personalityMap: Record<string, { name: string; desc: string }> = {
  'atmosphere-culture-discover': { name: '氛围漫游者', desc: '你享受城市的呼吸节奏，喜欢在不经意间发现美好' },
  'atmosphere-culture-chill': { name: '氛围漫游者', desc: '你享受城市的呼吸节奏，喜欢在不经意间发现美好' },
  'atmosphere-explore-discover': { name: '探索者', desc: '好奇心驱动你走进每一条未知的巷子' },
  'landmark-adventure-photo': { name: '收集者', desc: '你用镜头记录世界，每一帧都是珍藏' },
  'landmark-adventure-discover': { name: '收集者', desc: '你用镜头记录世界，每一帧都是珍藏' },
  'wander-relax-chill': { name: '漫游者', desc: '没有目的就是最好的目的，你享受纯粹的放空' },
  'wander-explore-discover': { name: '探索者', desc: '好奇心驱动你走进每一条未知的巷子' },
  'food-explore-taste': { name: '美食猎人', desc: '一座城市的灵魂藏在它的厨房里' },
  'food-culture-taste': { name: '美食猎人', desc: '一座城市的灵魂藏在它的厨房里' },
};

function getPersonality(answers: string[]): { name: string; desc: string } {
  const key = answers.join('-');
  if (personalityMap[key]) return personalityMap[key];

  const traits = answers.join(' ');
  if (traits.includes('food') || traits.includes('taste')) {
    return { name: '美食猎人', desc: '一座城市的灵魂藏在它的厨房里' };
  }
  if (traits.includes('photo') || traits.includes('landmark')) {
    return { name: '收集者', desc: '你用镜头记录世界，每一帧都是珍藏' };
  }
  if (traits.includes('chill') || traits.includes('relax')) {
    return { name: '漫游者', desc: '没有目的就是最好的目的，你享受纯粹的放空' };
  }
  if (traits.includes('discover') || traits.includes('explore')) {
    return { name: '探索者', desc: '好奇心驱动你走进每一条未知的巷子' };
  }
  return { name: '氛围漫游者', desc: '你享受城市的呼吸节奏，喜欢在不经意间发现美好' };
}

export function PersonalityTest({ onComplete, onSkip }: PersonalityTestProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ name: string; desc: string } | null>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const personality = getPersonality(newAnswers);
      setResult(personality);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">旅行性格偏好测试</span>
            <span className="text-xs text-blue-500 font-medium">{result ? '完成' : `${currentQ + 1} / ${questions.length}`}</span>
          </div>
          <div className="h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: result ? '100%' : `${((currentQ + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-6 leading-snug">
                {questions[currentQ].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQ].options.map((option, i) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => handleAnswer(option.value)}
                      className="w-full text-left p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/60 hover:border-blue-200 hover:shadow-sm hover:bg-white transition-all flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icon className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
                      </div>
                      <span className="text-sm text-slate-700 group-hover:text-blue-700 font-medium transition-colors">
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-white border border-blue-100/60 shadow-sm flex items-center justify-center">
                <Map className="w-10 h-10 text-blue-500" strokeWidth={1.8} />
              </div>
              <p className="text-xs text-blue-500 bg-blue-50 px-3 py-1 rounded-full inline-block font-medium tracking-wide mb-3">你的旅行人格</p>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{result.name}</h2>
              <p className="text-sm text-slate-500 mb-10 max-w-[280px] mx-auto leading-relaxed">{result.desc}</p>

              <button
                onClick={() => onComplete(result.name)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm shadow-blue-200 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                开始规划旅行
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip */}
        {!result && (
          <button
            onClick={onSkip}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition-colors mx-auto flex items-center gap-1.5"
          >
            <SkipForward className="w-3 h-3" />
            跳过测试
          </button>
        )}
      </div>
    </motion.div>
  );
}

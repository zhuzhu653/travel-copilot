'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreferenceSliders } from './PreferenceSliders';
import type { UserPreferences, Itinerary } from '@/app/page';

interface ChatInterfaceProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  chatHistory: Array<{ role: string; content: string }>;
  setChatHistory: React.Dispatch<React.SetStateAction<Array<{ role: string; content: string }>>>;
  onItineraryGenerated: (itinerary: Itinerary) => void;
}

export function ChatInterface({
  preferences,
  setPreferences,
  chatHistory,
  setChatHistory,
  onItineraryGenerated,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Show welcome message on first load
  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcomeMsg = preferences.personality
        ? `嗨！看起来你是一个「${preferences.personality}」✨ 很高兴成为你的旅行搭子～\n\n告诉我你的旅行想法吧，比如想去哪、玩几天、有什么特别想做的事？`
        : '嗨！我是你的旅行搭子 🧭\n\n告诉我你的旅行想法吧——想去哪、玩几天、有什么特别想做的事？随便聊聊就好～';
      
      setChatHistory([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newMessages);
    setInput('');
    setIsLoading(true);
    setMessageCount((c) => c + 1);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          action: 'chat',
        }),
      });

      const data = await res.json();
      if (data.content) {
        setChatHistory([...newMessages, { role: 'assistant', content: data.content }]);
      }
    } catch {
      setChatHistory([
        ...newMessages,
        { role: 'assistant', content: '抱歉，网络有点问题，请再试一次 🙏' },
      ]);
    } finally {
      setIsLoading(false);
    }

    // After 2 user messages, show preference sliders
    if (messageCount >= 1 && !showSliders) {
      setShowSliders(true);
    }
  };

  const getInspiration = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: '给我分享一个关于旅行目的地的有趣冷知识或者本地故事吧，要让人眼前一亮的那种！简短一些，2-3句话就好。' },
          ],
          action: 'chat',
        }),
      });

      const data = await res.json();
      if (data.content) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content: `💡 灵感发现\n\n${data.content}` },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '💡 冷知识：上海的弄堂里藏着很多隐蔽的咖啡馆，老虎窗外晾着衣服，里面却是精品手冲——这就是上海的"违和感美学"。' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateItinerary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory.map((m) => ({ role: m.role, content: m.content })),
          action: 'generate',
          preferences: preferences.weights,
        }),
      });

      const data = await res.json();
      if (data.content) {
        // Try to parse JSON from response
        const jsonMatch = data.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const itinerary = JSON.parse(jsonMatch[0]) as Itinerary;
          onItineraryGenerated(itinerary);
        }
      }
    } catch (e) {
      console.error('Generate error:', e);
      // Fallback: use mock data
      onItineraryGenerated(getMockItinerary());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 glass-card-strong border-b border-white/60 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-sky-400 flex items-center justify-center shadow-sm">
              <span className="text-lg">🧭</span>
            </div>
            <div>
              <h1 className="font-semibold text-navy-900 text-sm sm:text-base">Travel Copilot</h1>
              <p className="text-[11px] sm:text-xs text-primary-500">你的松弛旅行搭子</p>
            </div>
          </div>
          {preferences.personality && (
            <span className="text-xs bg-gradient-to-r from-primary-50 to-sky-50 text-primary-700 px-3 py-1.5 rounded-full border border-primary-100/50 font-medium">
              {preferences.personality}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md shadow-md shadow-primary-200/30'
                    : 'glass-card rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preference Sliders Panel */}
      <AnimatePresence>
        {showSliders && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-primary-100/30 bg-gradient-to-b from-white/60 to-primary-50/30 backdrop-blur-md overflow-hidden"
          >
            <PreferenceSliders
              weights={preferences.weights}
              onChange={(weights) => setPreferences((p) => ({ ...p, weights }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="sticky bottom-0 glass-card-strong border-t border-white/60 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="告诉我你的旅行想法..."
              rows={1}
              className="w-full resize-none rounded-xl bg-white/80 border border-primary-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-primary-500 to-sky-500 hover:from-primary-600 hover:to-sky-600 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setShowSliders(!showSliders)}
            className="text-xs bg-white/70 hover:bg-white border border-primary-100/50 text-primary-700 px-3 py-1.5 rounded-lg transition-all font-medium"
          >
            🎚️ {showSliders ? '收起偏好' : '调整偏好'}
          </button>
          <button
            onClick={getInspiration}
            disabled={isLoading}
            className="text-xs bg-white/70 hover:bg-white border border-amber-200/50 text-amber-700 px-3 py-1.5 rounded-lg transition-all font-medium disabled:opacity-50"
          >
            💡 灵感发现
          </button>
          {messageCount >= 2 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateItinerary}
              disabled={isLoading}
              className="text-xs bg-gradient-to-r from-primary-500 to-sky-500 hover:from-primary-600 hover:to-sky-600 disabled:from-gray-200 disabled:to-gray-300 text-white px-4 py-1.5 rounded-lg transition-all font-medium shadow-sm"
            >
              ✨ 生成行程方案
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getMockItinerary(): Itinerary {
  return {
    title: '端午上海 Citywalk · 氛围漫游版',
    version: '经典版',
    days: [
      {
        dayNumber: 1,
        spots: [
          {
            id: '1',
            name: '杨浦滨江工业遗存带',
            description: '百年工业遗迹与现代艺术的交融',
            reason: '人少景美，工业风出片率极高，节假日人流仅为外滩的1/10',
            crowdLevel: 'low',
            photoScore: 5,
            walkingMinutes: 45,
            bestTime: '9:00-11:00（光线最佳）',
            alternatives: ['复兴岛', '民生码头'],
            isLuckySpot: false,
            category: '拍照',
          },
          {
            id: '2',
            name: '定海桥互助社区',
            description: '藏在老城区的社区艺术空间',
            reason: '本地人才知道的文化据点，适合氛围感受者',
            crowdLevel: 'low',
            photoScore: 3,
            walkingMinutes: 20,
            bestTime: '10:30-12:00',
            alternatives: ['OCAT上海馆', '明当代美术馆'],
            isLuckySpot: false,
            category: '文化',
          },
          {
            id: '3',
            name: '平凉路菜市场',
            description: '最地道的上海市井烟火气',
            reason: '本地人日常采买的菜场，藏着老上海味道的早点摊',
            crowdLevel: 'medium',
            photoScore: 4,
            walkingMinutes: 15,
            bestTime: '11:30-13:00（午市最热闹）',
            alternatives: ['蒙西菜场', '乌中市集'],
            isLuckySpot: false,
            category: '美食',
          },
          {
            id: '4',
            name: '☕ Free Time Block',
            description: '找家咖啡馆歇一歇',
            reason: '上午步行约2小时，建议休息30-45分钟补充能量',
            crowdLevel: 'low',
            photoScore: 2,
            walkingMinutes: 0,
            bestTime: '13:00-14:00',
            alternatives: [],
            isLuckySpot: false,
            category: '休息',
          },
          {
            id: '5',
            name: '衡复风貌区支线（高安路-岳阳路）',
            description: '梧桐树下的法式老洋房漫步',
            reason: '避开武康路主干道，支线人流减少70%，出片率不减',
            crowdLevel: 'low',
            photoScore: 5,
            walkingMinutes: 60,
            bestTime: '14:30-16:30（树荫遮阳）',
            alternatives: ['愚园路', '新华路'],
            isLuckySpot: false,
            category: '拍照',
          },
          {
            id: '6',
            name: '🎲 Lucky Spot',
            description: '到达后揭晓的惊喜',
            reason: '基于你的人格和今日路线特别推荐，到了就知道了 😉',
            crowdLevel: 'low',
            photoScore: 4,
            walkingMinutes: 10,
            bestTime: '17:00-18:00',
            alternatives: [],
            isLuckySpot: true,
            category: '景点',
          },
        ],
      },
      {
        dayNumber: 2,
        spots: [
          {
            id: '7',
            name: '前滩花海公园',
            description: '城市中的大片花田，视野开阔',
            reason: '远离市中心，节假日人流低，自然光拍照极佳',
            crowdLevel: 'low',
            photoScore: 5,
            walkingMinutes: 40,
            bestTime: '8:30-10:30（晨光最美）',
            alternatives: ['辰山植物园', '共青森林公园'],
            isLuckySpot: false,
            category: '拍照',
          },
          {
            id: '8',
            name: '龙华寺素斋',
            description: '百年古刹的清净素食',
            reason: '脱离喧嚣的用餐体验，龙华素斋远近闻名',
            crowdLevel: 'medium',
            photoScore: 3,
            walkingMinutes: 15,
            bestTime: '11:00-12:30',
            alternatives: ['功德林', '枣子树'],
            isLuckySpot: false,
            category: '美食',
          },
          {
            id: '9',
            name: '🌿 午后留白',
            description: '不安排目的地的自由探索时间',
            reason: '这段时间属于你，可以就近逛逛或者找一家店发呆',
            crowdLevel: 'low',
            photoScore: 0,
            walkingMinutes: 0,
            bestTime: '13:00-14:30',
            alternatives: [],
            isLuckySpot: false,
            category: '休息',
          },
          {
            id: '10',
            name: '西岸艺术中心片区',
            description: '当代艺术与江景的完美结合',
            reason: '龙美术馆+西岸美术馆联动，室内为主不怕天气变化',
            crowdLevel: 'medium',
            photoScore: 4,
            walkingMinutes: 50,
            bestTime: '14:30-17:00',
            alternatives: ['余德耀美术馆', 'teamLab'],
            isLuckySpot: false,
            category: '文化',
          },
          {
            id: '11',
            name: '永康路小酒馆',
            description: '落日时分的微醺收尾',
            reason: '适合旅行最后一站的松弛收尾，氛围感满分',
            crowdLevel: 'medium',
            photoScore: 3,
            walkingMinutes: 10,
            bestTime: '17:30-19:00（黄金时段）',
            alternatives: ['安福路小酒馆', '巨鹿路'],
            isLuckySpot: false,
            category: '美食',
          },
        ],
      },
    ],
  };
}

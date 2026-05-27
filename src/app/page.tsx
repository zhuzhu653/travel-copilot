'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PersonalityTest } from '@/components/PersonalityTest';
import { ChatInterface } from '@/components/ChatInterface';
import { ItineraryView } from '@/components/ItineraryView';
import { FloatingPet } from '@/components/FloatingPet';

export type AppStage = 'welcome' | 'personality' | 'chat' | 'itinerary';

export interface UserPreferences {
  personality: string | null;
  weights: {
    crowd: number;
    photo: number;
    food: number;
    relax: number;
    budget: number;
    culture: number;
    nature: number;
  };
}

export interface SpotCard {
  id: string;
  name: string;
  description: string;
  reason: string;
  crowdLevel: 'low' | 'medium' | 'high';
  photoScore: number;
  walkingMinutes: number;
  bestTime: string;
  alternatives: string[];
  isLuckySpot?: boolean;
  category: string;
}

export interface Itinerary {
  title: string;
  version: string;
  days: {
    dayNumber: number;
    spots: SpotCard[];
  }[];
}

export default function Home() {
  const [stage, setStage] = useState<AppStage>('welcome');
  const [preferences, setPreferences] = useState<UserPreferences>({
    personality: null,
    weights: { crowd: 30, photo: 20, food: 20, relax: 10, budget: 10, culture: 5, nature: 5 },
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [returnedFromItinerary, setReturnedFromItinerary] = useState(false);

  const handleVersionSwitch = async (version: string): Promise<Itinerary | null> => {
    // 真正重新生成不同版本的行程
    try {
      const versionPrompt: Record<string, string> = {
        '保留原计划': '',
        '轻松版': '请将行程调整为轻松版：减少步行时间，增加休息点，每天最多4个地点，避免连续高体力消耗。',
        '雨天版': '请将行程调整为雨天版：优先室内场所（博物馆、咖啡馆、商场、书店），减少户外行走。',
        '拍照优先版': '请将行程调整为拍照优先版：优先选择出片率高的地点，注意光线时间段，增加拍照打卡点。',
      };

      const extraInstruction = versionPrompt[version] || '';
      if (!extraInstruction) {
        return itinerary;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: `[GENERATE_ITINERARY] ${extraInstruction} 请严格按JSON格式输出完整行程，不要输出任何解释文字。` },
          ],
          action: 'generate',
          preferences: preferences.weights,
        }),
      });

      const data = await res.json();
      if (data.content) {
        let jsonStr: string | null = null;
        const codeBlockMatch = data.content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        }
        if (!jsonStr) {
          const jsonMatch = data.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) jsonStr = jsonMatch[0];
        }
        if (jsonStr) {
          try {
            const newItinerary = JSON.parse(jsonStr) as Itinerary;
            if (newItinerary.days?.length > 0) {
              newItinerary.version = version;
              return newItinerary;
            }
          } catch {
            // parse failed
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {stage === 'welcome' && (
          <WelcomeScreen key="welcome" onStart={() => setStage('personality')} />
        )}
        {stage === 'personality' && (
          <PersonalityTest
            key="personality"
            onComplete={(personality) => {
              setPreferences((p) => ({ ...p, personality }));
              setStage('chat');
            }}
            onSkip={() => setStage('chat')}
          />
        )}
        {stage === 'chat' && (
          <ChatInterface
            key="chat"
            preferences={preferences}
            setPreferences={setPreferences}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            onItineraryGenerated={(it) => {
              setItinerary(it);
              setStage('itinerary');
            }}
            showSlidersOnMount={returnedFromItinerary}
          />
        )}
        {stage === 'itinerary' && itinerary && (
          <ItineraryView
            key="itinerary"
            itinerary={itinerary}
            preferences={preferences}
            onBack={() => {
              setReturnedFromItinerary(true);
              setStage('chat');
            }}
            onVersionSwitch={handleVersionSwitch}
          />
        )}
      </AnimatePresence>
      <FloatingPet currentStage={stage} />
    </main>
  );
}

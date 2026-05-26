'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PersonalityTest } from '@/components/PersonalityTest';
import { ChatInterface } from '@/components/ChatInterface';
import { ItineraryView } from '@/components/ItineraryView';

export type AppStage = 'welcome' | 'personality' | 'chat' | 'itinerary';

export interface UserPreferences {
  personality: string | null;
  weights: {
    crowd: number;
    photo: number;
    food: number;
    relax: number;
    budget: number;
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
    weights: { crowd: 40, photo: 30, food: 20, relax: 10, budget: 0 },
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

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
          />
        )}
        {stage === 'itinerary' && itinerary && (
          <ItineraryView
            key="itinerary"
            itinerary={itinerary}
            preferences={preferences}
            onBack={() => setStage('chat')}
            onVersionSwitch={(version) => {
              // Will trigger re-generation with different version
              setItinerary((prev) => prev ? { ...prev, version } : null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

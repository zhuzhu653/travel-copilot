'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import type { SpotCard } from '@/app/page';

interface MapViewProps {
  spots: SpotCard[];
  city?: string;
  onSpotClick?: (index: number) => void;
}

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

export function MapView({ spots, city = '上海', onSpotClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 常见城市坐标（经度, 纬度）
  const CITY_COORDS: Record<string, [number, number]> = {
    '上海': [121.4737, 31.2304], '北京': [116.4074, 39.9042],
    '杭州': [120.1551, 30.2741], '成都': [104.0668, 30.5728],
    '广州': [113.2644, 23.1291], '深圳': [114.0579, 22.5431],
    '南京': [118.7969, 32.0603], '西安': [108.9402, 34.3416],
    '重庆': [106.5516, 29.5630], '武汉': [114.3054, 30.5931],
    '长沙': [112.9388, 28.2282], '厦门': [118.0894, 24.4798],
    '苏州': [120.5853, 31.2989], '青岛': [120.3826, 36.0671],
    '三亚': [109.5080, 18.2479], '大理': [100.2250, 25.5896],
    '丽江': [100.2270, 26.8550], '桂林': [110.2900, 25.2742],
    '昆明': [102.8329, 25.0389], '哈尔滨': [126.6424, 45.7567],
    '东京': [139.6917, 35.6895], '大阪': [135.5022, 34.6937],
    '京都': [135.7681, 35.0116],
  };

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!key) {
      setError('未配置高德地图 Key');
      setIsLoading(false);
      return;
    }

    // Load AMap script with timeout for WeChat browser compatibility
    const loadAMap = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.AMap) {
          resolve();
          return;
        }

        const timeout = setTimeout(() => reject(new Error('地图加载超时')), 10000);

        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder,AMap.PlaceSearch`;
        script.async = true;
        script.onload = () => { clearTimeout(timeout); resolve(); };
        script.onerror = () => { clearTimeout(timeout); reject(new Error('高德地图加载失败')); };
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadAMap();

        if (!mapRef.current || !window.AMap) return;

        // Create map centered on city
        const cityCenter = CITY_COORDS[city] || CITY_COORDS['上海'];
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 13,
          center: cityCenter,
          viewMode: '2D',
          mapStyle: 'amap://styles/light',
        });
        mapInstance.current = map;

        // Use Geocoder to locate spots
        const geocoder = new window.AMap.Geocoder({ city: city });

        const visibleSpots = spots.filter((s) => !s.isLuckySpot && s.category !== '休息');
        const markers: any[] = [];

        for (let i = 0; i < visibleSpots.length; i++) {
          const spot = visibleSpots[i];
          try {
            // 简化搜索名并加上城市前缀，确保在正确城市搜索
            const searchName = spot.name.replace(/[（(].+?[）)]/g, '').replace(/·.+$/, '').trim() || spot.name;
            const fullQuery = `${city}${searchName}`;
            const result = await new Promise<any>((resolve) => {
              geocoder.getLocation(fullQuery, (status: string, result: any) => {
                resolve({ status, result });
              });
            });

            if (result.status === 'complete' && result.result.geocodes?.length > 0) {
              const { lng, lat } = result.result.geocodes[0].location;
              const marker = new window.AMap.Marker({
                position: [lng, lat],
                title: spot.name,
                label: {
                  content: `<div style="
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    white-space: nowrap;
                    box-shadow: 0 2px 6px rgba(37,99,235,0.3);
                    cursor: pointer;
                  ">${i + 1}. ${spot.name}</div>`,
                  direction: 'top',
                  offset: new window.AMap.Pixel(0, -6),
                },
              });
              marker.on('click', () => {
                if (onSpotClick) onSpotClick(i);
              });
              markers.push(marker);
              map.add(marker);
            }
          } catch {
            // Skip spots that can't be found
          }
        }

        // Fit map to show all markers
        if (markers.length > 0) {
          map.setFitView(markers, false, [60, 60, 60, 60]);
        }

        // Draw polyline connecting spots
        if (markers.length > 1) {
          const path = markers.map((m: any) => m.getPosition());
          new window.AMap.Polyline({
            path,
            strokeColor: '#3b82f6',
            strokeWeight: 3,
            strokeOpacity: 0.6,
            strokeStyle: 'dashed',
            map,
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Map error:', err);
        setError('地图加载失败，请稍后重试');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, [spots, city]);

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 text-center">
        <MapPin size={24} className="text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100/60 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-blue-600" />
          <h3 className="text-xs font-semibold text-slate-700">路线地图</h3>
        </div>
        <span className="text-[10px] text-slate-400">
          {spots.filter((s) => !s.isLuckySpot && s.category !== '休息').length} 个地点
        </span>
      </div>
      <div ref={mapRef} className="h-56 sm:h-72 w-full" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <Loader size={20} className="text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!key) {
      setError('未配置高德地图 Key');
      setIsLoading(false);
      return;
    }

    // Load AMap script
    const loadAMap = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.AMap) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder,AMap.PlaceSearch`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('高德地图加载失败'));
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadAMap();

        if (!mapRef.current || !window.AMap) return;

        // Create map
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 12,
          viewMode: '2D',
          mapStyle: 'amap://styles/light',
        });
        mapInstance.current = map;

        // Use PlaceSearch to find spots and add markers
        const placeSearch = new window.AMap.PlaceSearch({
          city: city,
          pageSize: 1,
        });

        const visibleSpots = spots.filter((s) => !s.isLuckySpot && s.category !== '休息');
        const markers: any[] = [];

        for (let i = 0; i < visibleSpots.length; i++) {
          const spot = visibleSpots[i];
          try {
            const result = await new Promise<any>((resolve) => {
              placeSearch.search(spot.name, (status: string, result: any) => {
                resolve({ status, result });
              });
            });

            if (result.status === 'complete' && result.result.poiList?.pois?.length > 0) {
              const poi = result.result.poiList.pois[0];
              const marker = new window.AMap.Marker({
                position: poi.location,
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

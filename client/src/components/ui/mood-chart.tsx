import { useEffect, useState } from 'react';
import { MoodHistoryEntry, Mood } from '@/types';
import { format, subDays } from 'date-fns';
import { useLanguage } from '@/lib/languages';

interface MoodChartProps {
  moodHistory: MoodHistoryEntry[];
  days?: number;
}

export function MoodChart({ moodHistory, days = 7 }: MoodChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<Array<{mood: Mood, score: number, date: string, label: string}>>([]);

  const EMOJI_MAP: Record<Mood, string> = {
    'very-sad': '😢',
    'sad': '😔',
    'neutral': '😐',
    'happy': '😊',
    'very-happy': '😄'
  };

  useEffect(() => {
    const data = [];
    const today = new Date();
    
    // Generate data for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'd');
      
      // Find matching entry from mood history
      const entry = moodHistory.find(e => e.date === dateStr);
      
      // Push data point
      data.push({
        date: dateStr,
        mood: entry?.mood || 'neutral',
        score: entry?.score || 0,
        label: dayLabel
      });
    }
    
    setChartData(data);
  }, [moodHistory, days]);
  
  return (
    <div className="w-full">
      <div className="chart-container mb-2">
        <div className="chart-line" style={{ bottom: '25%' }}></div>
        <div className="chart-line" style={{ bottom: '50%' }}></div>
        <div className="chart-line" style={{ bottom: '75%' }}></div>
        
        <div className="flex justify-between h-full">
          {chartData.map((entry, i) => (
            <div key={i} className="flex flex-col items-center justify-end h-full">
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${entry.score * 100}%`,
                  opacity: entry.score > 0 ? 1 : 0.1,
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        {chartData.map((entry, i) => (
          <div key={i} className="flex flex-col items-center">
            <div 
              className="mood-emoji mb-1" 
              style={{ 
                transform: `translateY(${entry.score > 0 ? -Math.max((entry.score * 20), 2) : 0}px)`,
                opacity: entry.score > 0 ? 1 : 0.3
              }}
            >
              {entry.score > 0 ? (
                <span className="text-xl">
                  {entry.mood in EMOJI_MAP ? EMOJI_MAP[entry.mood as Mood] : '😐'}
                </span>
              ) : null}
            </div>
            <span className="text-xs text-gray-400">{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MoodChart;
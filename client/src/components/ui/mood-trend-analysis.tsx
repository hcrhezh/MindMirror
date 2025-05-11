import { useEffect, useState } from 'react';
import { MoodHistoryEntry, Mood } from '@/types';
import { format, parseISO, subDays } from 'date-fns';
import { useLanguage } from '@/lib/languages';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface MoodTrendAnalysisProps {
  moodHistory: MoodHistoryEntry[];
  days?: number;
}

interface TrendData {
  date: string;
  score: number;
  mood: Mood;
  formattedDate: string;
}

export function MoodTrendAnalysis({ moodHistory, days = 30 }: MoodTrendAnalysisProps) {
  const { t } = useLanguage();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [trendDirection, setTrendDirection] = useState<'up' | 'down' | 'stable'>('stable');
  const [percentChange, setPercentChange] = useState<number>(0);

  useEffect(() => {
    if (moodHistory.length === 0) return;

    // Generate dates for the last N days
    const today = new Date();
    const dateMap = new Map<string, TrendData>();
    
    // Initialize with all dates in the range
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      dateMap.set(dateStr, {
        date: dateStr,
        score: 0,
        mood: 'neutral',
        formattedDate: format(date, 'MMM d')
      });
    }
    
    // Fill in with actual mood data
    moodHistory.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const dateStr = format(entryDate, 'yyyy-MM-dd');
      
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          score: entry.score,
          mood: entry.mood,
          formattedDate: format(entryDate, 'MMM d')
        });
      }
    });
    
    // Convert to array and sort by date
    const data = Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setTrendData(data);
    
    // Calculate trend
    if (data.length >= 7) {
      const recentScores = data.slice(-7).filter(d => d.score > 0);
      const earlierScores = data.slice(-14, -7).filter(d => d.score > 0);
      
      if (recentScores.length > 0 && earlierScores.length > 0) {
        const recentAvg = recentScores.reduce((sum, d) => sum + d.score, 0) / recentScores.length;
        const earlierAvg = earlierScores.reduce((sum, d) => sum + d.score, 0) / earlierScores.length;
        
        const change = recentAvg - earlierAvg;
        const percentChange = (change / earlierAvg) * 100;
        
        setTrendDirection(change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'stable');
        setPercentChange(Math.abs(percentChange));
      }
    }
  }, [moodHistory, days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].payload.score > 0) {
      const data = payload[0].payload;
      
      return (
        <div className="p-2 bg-dark-800 border border-dark-700 rounded-lg shadow-lg">
          <p className="font-medium text-sm">{data.formattedDate}</p>
          <p className="text-xs text-primary-300">{t('moodScore')}: {data.score.toFixed(2)}</p>
        </div>
      );
    }
    
    return null;
  };

  const getTrendMessage = () => {
    switch (trendDirection) {
      case 'up':
        return (
          <div className="flex items-center text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
            {t('moodTrendUp').replace('{percent}', percentChange.toFixed(0))}
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M12 5v14" />
              <path d="M19 12l-7 7-7-7" />
            </svg>
            {t('moodTrendDown').replace('{percent}', percentChange.toFixed(0))}
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M5 12h14" />
            </svg>
            {t('moodTrendStable')}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-400">{t('moodTrendTitle')}</h3>
        {getTrendMessage()}
      </div>
      
      <div className="h-[200px]">
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#a0aec0', fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
              />
              <YAxis 
                domain={[0, 1]} 
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="url(#colorScore)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--card))' }}
              />
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('noMoodTrendData')}
          </div>
        )}
      </div>
    </div>
  );
}

export default MoodTrendAnalysis;
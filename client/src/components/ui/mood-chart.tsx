import { useEffect, useState } from 'react';
import { MoodHistoryEntry } from '@/types';
import { format, subDays } from 'date-fns';
import { useLanguage } from '@/lib/languages';

interface MoodChartProps {
  moodHistory: MoodHistoryEntry[];
  days?: number;
}

export default function MoodChart({ moodHistory, days = 7 }: MoodChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<Array<{date: string, score: number, label: string}>>([]);
  
  useEffect(() => {
    // Process mood history data for the chart
    const today = new Date();
    const chartEntries = [];
    
    // Generate data for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Find mood entry for this date
      const entry = moodHistory.find(item => item.date === dateString);
      
      chartEntries.push({
        date: dateString,
        score: entry?.score || 0,
        label: i === 0 ? t('Today') : format(date, 'E')
      });
    }
    
    setChartData(chartEntries);
  }, [moodHistory, days, t]);

  return (
    <div className="gradient-bg p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{t('moodHistory')}</h3>
        <button className="text-xs text-gray-400">{t('lastDays')}</button>
      </div>
      
      <div className="chart-container mb-2">
        {/* Chart grid lines */}
        <div className="chart-line" style={{ bottom: '25%' }}></div>
        <div className="chart-line" style={{ bottom: '50%' }}></div>
        <div className="chart-line" style={{ bottom: '75%' }}></div>
        
        {/* Chart bars */}
        {chartData.map((entry, index) => (
          <div 
            key={entry.date}
            className="chart-bar" 
            style={{ 
              left: `${(index / chartData.length) * 100}%`, 
              height: `${entry.score * 100}%` 
            }}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        {chartData.map(entry => (
          <div key={entry.date}>{entry.label}</div>
        ))}
      </div>
    </div>
  );
}

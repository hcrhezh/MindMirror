import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodHistoryEntry } from '@/types';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/lib/languages';

interface WeeklyMoodBreakdownProps {
  moodHistory: MoodHistoryEntry[];
}

interface DayAverage {
  name: string; // Day of the week
  average: number; // Average mood score for that day
  count: number; // Number of entries
}

export function WeeklyMoodBreakdown({ moodHistory }: WeeklyMoodBreakdownProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<DayAverage[]>([]);

  useEffect(() => {
    // Map to hold sums and counts for each day of the week
    const dayMap: Record<string, { sum: number; count: number }> = {
      'Sun': { sum: 0, count: 0 },
      'Mon': { sum: 0, count: 0 },
      'Tue': { sum: 0, count: 0 },
      'Wed': { sum: 0, count: 0 },
      'Thu': { sum: 0, count: 0 },
      'Fri': { sum: 0, count: 0 },
      'Sat': { sum: 0, count: 0 }
    };
    
    // Aggregate data by day of week
    moodHistory.forEach(entry => {
      if (entry.score > 0) { // Only include valid scores
        const date = parseISO(entry.date);
        const dayName = format(date, 'E'); // Get short day name (Sun, Mon, etc.)
        
        dayMap[dayName].sum += entry.score;
        dayMap[dayName].count += 1;
      }
    });
    
    // Calculate averages and prepare chart data
    const data: DayAverage[] = Object.entries(dayMap).map(([name, { sum, count }]) => ({
      name,
      average: count > 0 ? sum / count : 0,
      count
    }));
    
    // Reorder days to start with Sunday
    const orderedDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const orderedData = orderedDays.map(day => 
      data.find(item => item.name === day) || { name: day, average: 0, count: 0 }
    );
    
    setChartData(orderedData);
  }, [moodHistory]);

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value.toFixed(2);
      const count = chartData.find(d => d.name === label)?.count || 0;
      
      return (
        <div className="p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg text-white">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`${t('averageMood')}: ${value}`}</p>
          <p className="text-xs text-gray-300">{`${t('entriesCount')}: ${count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[200px]">
      {chartData.some(day => day.average > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#a0aec0', fontSize: 12 }}
              axisLine={{ stroke: '#4a5568' }}
              tickLine={false}
            />
            <YAxis 
              hide={true}
              domain={[0, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="average" 
              fill="url(#colorGradient)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={35}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          {t('noMoodDataByDay')}
        </div>
      )}
    </div>
  );
}

export default WeeklyMoodBreakdown;
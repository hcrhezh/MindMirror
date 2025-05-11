import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Emotion } from '@/types';
import { useLanguage } from '@/lib/languages';

interface EmotionDistributionProps {
  emotions: Emotion[];
}

const EMOTION_COLORS = [
  '#7953d2', // primary
  '#00b8d9', // secondary
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#ff6b6b',
  '#a4de6c'
];

export function EmotionDistribution({ emotions }: EmotionDistributionProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Convert emotions to pie chart data format
    const data = emotions.map(emotion => ({
      name: emotion.name,
      value: emotion.percentage
    }));
    
    setChartData(data);
  }, [emotions]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg text-white">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[250px]">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          {t('noEmotionData')}
        </div>
      )}
    </div>
  );
}

export default EmotionDistribution;
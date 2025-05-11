import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoodHistoryEntry, Emotion } from '@/types';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { useLanguage } from '@/lib/languages';
import MoodChart from '@/components/ui/mood-chart';
import EmotionDistribution from '@/components/ui/emotion-distribution';
import WeeklyMoodBreakdown from '@/components/ui/weekly-mood-breakdown';
import MoodTrendAnalysis from '@/components/ui/mood-trend-analysis';

interface MoodAnalyticsProps {
  moodHistory: MoodHistoryEntry[];
}

interface EmotionTrend {
  name: string;
  count: number;
}

interface AverageMoodByDay {
  name: string;
  average: number;
}

const MOOD_SCORES = {
  'very-sad': 1,
  'sad': 2,
  'neutral': 3,
  'happy': 4,
  'very-happy': 5
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#6BCB77', '#4D96FF'];

export function MoodAnalytics({ moodHistory }: MoodAnalyticsProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [filteredData, setFilteredData] = useState<MoodHistoryEntry[]>([]);
  const [emotionTrends, setEmotionTrends] = useState<EmotionTrend[]>([]);
  const [averageMoodByDay, setAverageMoodByDay] = useState<AverageMoodByDay[]>([]);

  useEffect(() => {
    const now = new Date();
    let daysToSubtract = 7;
    
    if (timeRange === '30d') daysToSubtract = 30;
    if (timeRange === '90d') daysToSubtract = 90;
    
    const dateThreshold = subDays(now, daysToSubtract);
    
    // Filter entries within the selected time range
    const filtered = moodHistory.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isAfter(entryDate, dateThreshold);
    });
    
    setFilteredData(filtered);
    
    // Calculate emotion trends
    const emotionsMap = new Map<string, number>();
    
    filtered.forEach(entry => {
      if (entry.emotions) {
        entry.emotions.forEach((emotion: Emotion) => {
          const current = emotionsMap.get(emotion.name) || 0;
          emotionsMap.set(emotion.name, current + 1);
        });
      }
    });
    
    const emotionsList = Array.from(emotionsMap.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 8); // Top 8 emotions
    
    setEmotionTrends(emotionsList);
    
    // Calculate average mood by day of week
    const moodsByDay = new Map<string, {total: number, count: number}>();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    filtered.forEach(entry => {
      const date = parseISO(entry.date);
      const dayName = daysOfWeek[date.getDay()];
      const moodScore = MOOD_SCORES[entry.mood];
      
      const current = moodsByDay.get(dayName) || {total: 0, count: 0};
      moodsByDay.set(dayName, {
        total: current.total + moodScore,
        count: current.count + 1
      });
    });
    
    const averageMoods = daysOfWeek.map(day => {
      const stats = moodsByDay.get(day);
      return {
        name: day,
        average: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0
      };
    });
    
    setAverageMoodByDay(averageMoods);
    
  }, [moodHistory, timeRange]);

  const renderLineChart = () => {
    const chartData = filteredData.map(entry => ({
      date: format(parseISO(entry.date), 'MM/dd'),
      score: entry.score
    })).sort((a, b) => {
      const dateA = a.date.split('/').map(Number);
      const dateB = b.date.split('/').map(Number);
      
      // Compare months
      if (dateA[0] !== dateB[0]) return dateA[0] - dateB[0];
      // Compare days
      return dateA[1] - dateB[1];
    });

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            name={t('moodScore')}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderEmotionsChart = () => {
    if (emotionTrends.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          {t('noEmotionData')}
        </div>
      );
    }
    
    // Convert emotionTrends to the format required by EmotionDistribution
    const totalCount = emotionTrends.reduce((sum, e) => sum + e.count, 0);
    const emotions = emotionTrends.map(trend => ({
      name: trend.name,
      percentage: Math.round((trend.count / totalCount) * 100)
    }));
    
    return <EmotionDistribution emotions={emotions} />;
  };

  const renderDayOfWeekChart = () => {
    if (averageMoodByDay.length === 0 || !averageMoodByDay.some(day => day.average > 0)) {
      return (
        <div className="text-center py-4 text-gray-400">
          {t('noMoodDataByDay')}
        </div>
      );
    }
    
    return <WeeklyMoodBreakdown moodHistory={filteredData} />;
  };

  // Function to get emotion insights
  const getEmotionInsights = () => {
    if (emotionTrends.length === 0) return null;
    
    // Most common emotion
    const topEmotion = emotionTrends[0].name;
    
    // Positive vs negative ratio (simplified)
    const positiveEmotions = ['happy', 'joy', 'excited', 'grateful', 'content', 'calm', 'hopeful', 'confident'];
    const negativeEmotions = ['anxious', 'stressed', 'sad', 'angry', 'frustrated', 'worried', 'fearful', 'overwhelmed'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    emotionTrends.forEach(emotion => {
      if (positiveEmotions.includes(emotion.name.toLowerCase())) {
        positiveCount += emotion.count;
      } else if (negativeEmotions.includes(emotion.name.toLowerCase())) {
        negativeCount += emotion.count;
      }
    });
    
    const total = positiveCount + negativeCount;
    const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
    const negativePercentage = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
    
    return (
      <div className="mt-4 gradient-bg p-4 rounded-xl">
        <h4 className="font-medium mb-2">{t('emotionInsights')}</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <span className="text-primary-400 font-medium">{topEmotion}</span> {t('topEmotionExplanation')}
          </p>
          {total > 0 && (
            <div>
              <p className="mb-1">{t('emotionBalance')}:</p>
              <div className="w-full bg-dark-600 rounded-full h-2 mb-1">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${positivePercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>{t('moodNegative')}: {negativePercentage}%</span>
                <span>{t('moodPositive')}: {positivePercentage}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to render emotion tags
  const renderEmotionTags = () => {
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">{t('frequentEmotions')}</h4>
        <div className="flex flex-wrap">
          {emotionTrends.map((emotion, index) => (
            <div key={index} className="emotion-pill">
              {emotion.name} <span className="ml-1 opacity-70">({emotion.count})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Check if we're likely using sample data (assuming sample data always has entries)
  const isLikelySampleData = moodHistory.length >= 10 && 
    moodHistory.every(entry => entry.emotions && entry.emotions.length > 0);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('advancedMoodAnalytics')}</CardTitle>
        <CardDescription>{t('moodAnalyticsDescription')}</CardDescription>
        
        {isLikelySampleData && (
          <div className="mt-1 p-2 bg-primary-900/30 border border-primary-800/40 rounded-md">
            <p className="text-xs text-primary-300 italic">
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                {t('sampleDataNotice')}
              </span>
            </p>
          </div>
        )}
        
        <div className="flex space-x-2 mt-2">
          <button 
            className={`px-3 py-1 rounded transition ${timeRange === '7d' ? 'bg-primary text-primary-foreground' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setTimeRange('7d')}
          >
            {t('last7Days')}
          </button>
          <button 
            className={`px-3 py-1 rounded transition ${timeRange === '30d' ? 'bg-primary text-primary-foreground' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setTimeRange('30d')}
          >
            {t('last30Days')}
          </button>
          <button 
            className={`px-3 py-1 rounded transition ${timeRange === '90d' ? 'bg-primary text-primary-foreground' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setTimeRange('90d')}
          >
            {t('last90Days')}
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-10">
            <p>{t('noMoodDataAvailable')}</p>
          </div>
        ) : (
          <Tabs defaultValue="trends">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">{t('moodTrends')}</TabsTrigger>
              <TabsTrigger value="emotions">{t('commonEmotions')}</TabsTrigger>
              <TabsTrigger value="weekday">{t('dayOfWeekAnalysis')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="mt-4 analytics-tab-content">
              <h3 className="text-lg font-medium mb-3">{t('moodTrends')}</h3>
              <div className="gradient-bg p-4 rounded-xl mb-4">
                {renderLineChart()}
              </div>
              
              <div className="analytics-grid">
                <div className="gradient-bg p-4 rounded-xl">
                  <h4 className="font-medium mb-2">{t('moodHighlights')}</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {filteredData.length > 0 && (
                      <>
                        <li className="flex items-center">
                          <span className="text-lg mr-2">📈</span>
                          <span>
                            {t('averageMoodScore')}: <span className="text-primary-400 font-medium">
                              {(filteredData.reduce((acc, entry) => acc + entry.score, 0) / filteredData.length).toFixed(1)}
                            </span>
                          </span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-lg mr-2">⭐</span>
                          <span>
                            {t('highestMoodDay')}: <span className="text-primary-400 font-medium">
                              {format(parseISO(filteredData.sort((a, b) => b.score - a.score)[0]?.date || new Date().toISOString()), 'MMM d')}
                            </span>
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="gradient-bg p-4 rounded-xl">
                  <MoodTrendAnalysis moodHistory={filteredData} days={timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="emotions" className="mt-4 analytics-tab-content">
              <h3 className="text-lg font-medium mb-3">{t('emotionalProfile')}</h3>
              
              <div className="analytics-grid">
                <div className="gradient-bg p-4 rounded-xl">
                  <h4 className="font-medium mb-2">{t('emotionDistribution')}</h4>
                  <div className="h-[250px]">
                    {renderEmotionsChart()}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {getEmotionInsights()}
                  {renderEmotionTags()}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="weekday" className="mt-4 analytics-tab-content">
              <h3 className="text-lg font-medium mb-3">{t('weekdayPatterns')}</h3>
              
              <div className="gradient-bg p-4 rounded-xl mb-4">
                {renderDayOfWeekChart()}
              </div>
              
              <div className="gradient-bg p-4 rounded-xl">
                <h4 className="font-medium mb-2">{t('weekdayInsights')}</h4>
                {averageMoodByDay.length > 0 && (
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>
                      {t('bestDay')}: <span className="text-primary-400 font-medium">
                        {averageMoodByDay.sort((a, b) => b.average - a.average)[0]?.name}
                      </span>
                    </p>
                    <p>
                      {t('challengingDay')}: <span className="text-primary-400 font-medium">
                        {averageMoodByDay.filter(d => d.average > 0).sort((a, b) => a.average - b.average)[0]?.name || '-'}
                      </span>
                    </p>
                    <p className="mt-4 text-gray-400">
                      {t('weekdayTip')}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default MoodAnalytics;
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/lib/languages';
import { DailyTip, Mood } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { getDailyTips, saveDailyTip } from '@/lib/storage';
import { format } from 'date-fns';
import NavigationBar from '@/components/layout/navigation-bar';
import TabNavigation from '@/components/layout/tab-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';
import AssistantMessage from '@/components/assistant-message';
import EmojiMoodSelector from '@/components/ui/emoji-mood-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DailyTipsPage() {
  const { t, currentLanguage } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedMoodScore, setSelectedMoodScore] = useState<number>(0);
  const [dailyTips, setDailyTips] = useState<DailyTip[]>([]);
  const [todayTip, setTodayTip] = useState<DailyTip | null>(null);
  
  // Get daily tips from storage
  useEffect(() => {
    const tips = getDailyTips();
    setDailyTips(tips);
    
    // Check if we have today's tip
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysTip = tips.find(tip => tip.date === today);
    if (todaysTip) {
      setTodayTip(todaysTip);
    }
  }, []);
  
  // Generate daily tips mutation
  const generateTipsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/generate/daily-tips', {
        mood: selectedMood,
        moodScore: selectedMoodScore,
        language: currentLanguage
      });
      return response.json();
    },
    onSuccess: (data: { affirmation: string, meditation: string, selfCare: string[] }) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const newTip: Omit<DailyTip, 'id'> = {
        date: today,
        affirmation: data.affirmation,
        meditation: data.meditation,
        selfCare: data.selfCare,
        mood: selectedMood || undefined,
        language: currentLanguage,
        userId: 1
      };
      
      const savedTip = saveDailyTip(newTip);
      setTodayTip(savedTip);
      setDailyTips([...dailyTips, savedTip]);
    }
  });

  const handleMoodSelect = (mood: Mood, score: number) => {
    setSelectedMood(mood);
    setSelectedMoodScore(score);
  };
  
  const handleGenerateTips = () => {
    if (selectedMood) {
      generateTipsMutation.mutate();
    }
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavigationBar />
      <TabNavigation />
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Daily Wellness Guide</h2>
            <p className="text-gray-400">Personalized self-care and mindfulness tips for today.</p>
          </div>
          
          {/* Mood Selection (if no tip for today) */}
          {!todayTip && (
            <div className="mb-6 space-y-4">
              <p className="text-sm text-gray-300">How are you feeling today? This will help us personalize your tips.</p>
              
              <EmojiMoodSelector onSelect={handleMoodSelect} />
              
              <Button 
                className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 transition text-white font-medium"
                onClick={handleGenerateTips}
                disabled={generateTipsMutation.isPending || !selectedMood}
              >
                {generateTipsMutation.isPending ? 'Generating...' : 'Generate My Daily Tips'}
              </Button>
            </div>
          )}
          
          {/* Today's Tips */}
          {todayTip && (
            <div className="mb-6 space-y-4">
              <AssistantMessage message="Here are your personalized wellness tips for today. I've created these specifically for you based on your mood and past patterns." />
              
              <Card className="gradient-bg border-dark-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <span className="material-icons text-primary-400 mr-2">auto_awesome</span>
                    Daily Affirmation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg italic text-gray-100 p-3 border-l-2 border-primary-500">
                    "{todayTip.affirmation}"
                  </p>
                </CardContent>
              </Card>
              
              {todayTip.meditation && (
                <Card className="gradient-bg border-dark-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <span className="material-icons text-primary-400 mr-2">self_improvement</span>
                      Meditation Script
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">{todayTip.meditation}</p>
                    <Button variant="outline" className="mt-3 bg-dark-700 hover:bg-dark-600 border-0">
                      <span className="material-icons mr-2">play_circle</span>
                      Play Guided Audio
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <Card className="gradient-bg border-dark-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <span className="material-icons text-primary-400 mr-2">favorite</span>
                    Self-Care Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayTip.selfCare.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="material-icons text-secondary-400 mt-0.5">check_circle</span>
                        <p className="text-sm text-gray-300">{activity}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                variant="outline" 
                className="w-full py-3 bg-dark-700 hover:bg-dark-600 border-0"
                onClick={() => setTodayTip(null)}
              >
                Generate New Tips
              </Button>
            </div>
          )}
          
          {/* Previous Tips */}
          {dailyTips.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Previous Wellness Tips</h3>
              <div className="space-y-3">
                {dailyTips.slice(0, 3).map((tip) => (
                  <div key={tip.id} className="gradient-bg p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">{format(new Date(tip.date), 'MMM d, yyyy')}</span>
                      {tip.mood && (
                        <span className="text-xl">
                          {tip.mood === 'very-sad' ? '😢' : 
                           tip.mood === 'sad' ? '😔' : 
                           tip.mood === 'neutral' ? '😐' : 
                           tip.mood === 'happy' ? '😊' : '😄'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 italic mb-2">"{tip.affirmation}"</p>
                    {tip.selfCare.length > 0 && (
                      <p className="text-xs text-gray-400">
                        <span className="material-icons text-xs align-text-bottom mr-1">check_circle</span>
                        {tip.selfCare[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

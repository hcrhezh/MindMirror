import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/lib/languages';
import { MoodHistoryEntry, Mood, MoodAnalysis } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { getMoodHistory, saveMoodEntry, saveJournalEntry } from '@/lib/storage';
import generateSampleMoodHistory from '@/lib/sample-data';
import NavigationBar from '@/components/layout/navigation-bar';
import TabNavigation from '@/components/layout/tab-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';
import EmojiMoodSelector from '@/components/ui/emoji-mood-selector';
import MoodChart from '@/components/ui/mood-chart';
import MoodAnalytics from '@/components/ui/mood-analytics';
import AssistantMessage from '@/components/assistant-message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

export default function MoodPage() {
  const { t, currentLanguage } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedMoodScore, setSelectedMoodScore] = useState<number>(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Get mood history from storage
  useEffect(() => {
    const history = getMoodHistory();
    
    // If there's no history or very limited data, use sample data for better visualization
    if (history.length < 5) {
      // Use actual data + sample data
      const sampleHistory = generateSampleMoodHistory(60);
      
      // Only use samples for dates we don't have real data for
      const existingDates = new Set(history.map(entry => entry.date));
      const filteredSamples = sampleHistory.filter(sample => !existingDates.has(sample.date));
      
      // Combine real data with sample data
      setMoodHistory([...history, ...filteredSamples]);
    } else {
      setMoodHistory(history);
    }
  }, []);
  
  // Analyze mood mutation
  const analyzeMoodMutation = useMutation({
    mutationFn: async () => {
      setApiError(null); // Reset any previous errors
      try {
        console.log("Sending request to analyze mood with data:", {
          text: journalEntry,
          selectedMood,
          selectedMoodScore,
          language: currentLanguage
        });
        
        const response = await apiRequest('POST', '/api/analyze/mood', {
          text: journalEntry,
          selectedMood: selectedMood,
          selectedMoodScore: selectedMoodScore,
          language: currentLanguage
        });
        
        console.log("API response status:", response.status);
        const data = await response.json();
        console.log("API response data:", data);
        
        // Check if the response contains an error
        if (!response.ok) {
          if (data.error === 'api_key_missing' || data.error === 'api_key_invalid') {
            throw new Error("Gemini API key is missing or invalid. Please check your API key configuration.");
          } else if (data.error === 'rate_limit_exceeded') {
            throw new Error("The Gemini API quota has been exceeded. Please try again later or contact support.");
          } else if (data.error === 'model_not_found') {
            throw new Error("The requested Gemini model was not found. Please check your app configuration.");
          } else {
            throw new Error(data.message || "An error occurred while analyzing your mood.");
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error in API request:", error);
        throw error;
      }
    },
    onSuccess: (data: MoodAnalysis) => {
      // Save mood entry to history
      const entry: MoodHistoryEntry = {
        date: format(new Date(), 'yyyy-MM-dd'),
        mood: data.mood,
        score: data.score,
        journalEntry: journalEntry,
        emotions: data.emotions
      };
      
      saveMoodEntry(entry);
      
      // Save journal entry
      saveJournalEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        text: journalEntry,
        mood: data.mood,
        moodScore: data.score,
        emotions: data.emotions,
        language: currentLanguage,
        userId: 1
      });
      
      // Update mood history
      setMoodHistory([...moodHistory, entry]);
      
      // Show the analysis
      setShowAnalysis(true);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/mood-history'] });
    },
    onError: (error: Error) => {
      console.error("Mood analysis error:", error);
      setApiError(error.message);
    }
  });

  const handleMoodSelect = (mood: Mood, score: number) => {
    setSelectedMood(mood);
    setSelectedMoodScore(score);
  };
  
  const handleAnalyze = () => {
    if (selectedMood || journalEntry.trim()) {
      analyzeMoodMutation.mutate();
    }
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavigationBar />
      <TabNavigation />
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Greeting */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">{t('greeting')}</h2>
            <p className="text-gray-400">{t('howAreYou')}</p>
          </div>
          
          {/* Mood Selector */}
          <div className="mb-6">
            <EmojiMoodSelector onSelect={handleMoodSelect} />
          </div>
          
          {/* Journaling Section */}
          <div className="gradient-bg p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{t('expressThoughts')}</h3>
              <Button variant="outline" size="sm" className="text-xs px-3 py-1 rounded-full bg-dark-700 flex items-center border-0">
                <Mic className="h-4 w-4 mr-1" />
                {t('voice')}
              </Button>
            </div>
            
            <Textarea 
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="w-full bg-dark-700 text-gray-100 rounded-lg p-3 h-32 focus:outline-none focus:ring-1 focus:ring-primary-400 placeholder-gray-500"
              placeholder={t('journalPlaceholder')}
            />
            
            {apiError && (
              <div className="mt-2 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded-lg text-sm mb-2">
                <div className="flex items-start space-x-2">
                  <span className="material-icons text-red-400 mt-0.5 text-sm">error</span>
                  <p>{apiError}</p>
                </div>
              </div>
            )}
            
            <Button 
              className="w-full mt-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition text-white font-medium"
              onClick={handleAnalyze}
              disabled={analyzeMoodMutation.isPending}
            >
              {analyzeMoodMutation.isPending ? 'Analyzing...' : t('analyzeMood')}
            </Button>
          </div>
          
          {/* AI Assistant Response */}
          {showAnalysis && (
            <div className="mb-6">
              <AssistantMessage 
                message="I sense that you're feeling a bit anxious today. Your thoughts reveal some concern about your upcoming presentation. Remember that it's normal to feel nervous before important events."
              />
              
              <div className="gradient-bg p-4 rounded-xl mb-4 mt-4">
                <h3 className="font-medium mb-2">{t('moodAnalysis')}</h3>
                <div className="flex items-center mb-3">
                  <div className="text-2xl mr-3">
                    {selectedMood === 'very-sad' ? '😢' : 
                     selectedMood === 'sad' ? '😔' : 
                     selectedMood === 'neutral' ? '😐' : 
                     selectedMood === 'happy' ? '😊' : '😄'}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-700 to-secondary-500 h-2 rounded-full" 
                        style={{ width: `${selectedMoodScore * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{t('negative')}</span>
                      <span>{t('neutral')}</span>
                      <span>{t('positive')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <p>{t('primaryEmotions')}: <span className="text-secondary-400">Anxiety (65%), Worry (20%), Hope (15%)</span></p>
                </div>
              </div>
              
              <div className="gradient-bg p-4 rounded-xl">
                <h3 className="font-medium mb-3">{t('personalizedSuggestions')}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="material-icons text-secondary-400 mt-0.5">tips_and_updates</span>
                    <p className="text-sm text-gray-300">Try a 5-minute deep breathing exercise before your presentation preparation.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="material-icons text-secondary-400 mt-0.5">tips_and_updates</span>
                    <p className="text-sm text-gray-300">Write down 3 things that would make your presentation successful. Focus on these achievable goals.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="material-icons text-secondary-400 mt-0.5">tips_and_updates</span>
                    <p className="text-sm text-gray-300">Schedule a short walk outside to clear your mind. Nature can help reduce anxiety.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mood History */}
          <div className="mb-6">
            <MoodChart moodHistory={moodHistory} />
          </div>

          {/* Advanced Mood Analytics */}
          <MoodAnalytics moodHistory={moodHistory} />
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

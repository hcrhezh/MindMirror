import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/lib/languages';
import { apiRequest } from '@/lib/queryClient';
import { saveJournalEntry } from '@/lib/storage';
import NavigationBar from '@/components/layout/navigation-bar';
import TabNavigation from '@/components/layout/tab-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';
import AssistantMessage from '@/components/assistant-message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';
import { format } from 'date-fns';

export default function ThoughtsPage() {
  const { t, currentLanguage } = useLanguage();
  const [thoughtText, setThoughtText] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [clarifiedThoughts, setClarifiedThoughts] = useState('');
  const [actionSteps, setActionSteps] = useState<string[]>([]);
  
  // Clarify thoughts mutation
  const clarifyThoughtsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/analyze/thoughts', {
        text: thoughtText,
        language: currentLanguage
      });
      return response.json();
    },
    onSuccess: (data: { clarifiedThoughts: string, actionSteps: string[] }) => {
      setClarifiedThoughts(data.clarifiedThoughts);
      setActionSteps(data.actionSteps);
      setShowAnalysis(true);
      
      // Save journal entry
      saveJournalEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        text: thoughtText,
        language: currentLanguage,
        userId: 1
      });
    }
  });

  const handleClarify = () => {
    if (thoughtText.trim()) {
      clarifyThoughtsMutation.mutate();
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
            <h2 className="text-2xl font-semibold text-white">{t('clarifyThoughts')}</h2>
            <p className="text-gray-400">Turn unclear, anxious, or overthinking thoughts into clear action steps.</p>
          </div>
          
          {/* Input Section */}
          <div className="gradient-bg p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Share your thoughts</h3>
              <Button variant="outline" size="sm" className="text-xs px-3 py-1 rounded-full bg-dark-700 flex items-center border-0">
                <Mic className="h-4 w-4 mr-1" />
                {t('voice')}
              </Button>
            </div>
            
            <Textarea 
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              className="w-full bg-dark-700 text-gray-100 rounded-lg p-3 h-32 focus:outline-none focus:ring-1 focus:ring-primary-400 placeholder-gray-500"
              placeholder="What's on your mind today? What are you overthinking or feeling anxious about?"
            />
            
            <Button 
              className="w-full mt-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition text-white font-medium"
              onClick={handleClarify}
              disabled={clarifyThoughtsMutation.isPending || !thoughtText.trim()}
            >
              {clarifyThoughtsMutation.isPending ? 'Processing...' : 'Clarify My Thoughts'}
            </Button>
          </div>
          
          {/* AI Response */}
          {showAnalysis && (
            <div className="mb-6 space-y-4">
              <AssistantMessage message={clarifiedThoughts} />
              
              <div className="gradient-bg p-4 rounded-xl">
                <h3 className="font-medium mb-3">Action Steps</h3>
                <div className="space-y-3">
                  {actionSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-primary-900 rounded-full p-1 flex-shrink-0">
                        <span className="material-icons text-primary-200 text-sm">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="gradient-bg p-4 rounded-xl">
                <h3 className="font-medium mb-3">Daily Affirmation</h3>
                <p className="text-sm italic text-gray-300 p-3 border-l-2 border-primary-500">
                  "I acknowledge my thoughts without judgment. I have the power to reshape them into positive action."
                </p>
              </div>
            </div>
          )}
          
          {/* Tips */}
          <div className="gradient-bg p-4 rounded-xl mb-6">
            <h3 className="font-medium mb-3">Thought Clarification Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-secondary-400 mt-0.5">lightbulb</span>
                <p className="text-sm text-gray-300">Be specific about what's bothering you rather than using generalizations.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-secondary-400 mt-0.5">lightbulb</span>
                <p className="text-sm text-gray-300">Include how your thoughts make you feel physically and emotionally.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-secondary-400 mt-0.5">lightbulb</span>
                <p className="text-sm text-gray-300">Try to identify what triggered these thoughts if possible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

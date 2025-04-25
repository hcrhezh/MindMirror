import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/lib/languages';
import { RelationshipAnalysis } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import NavigationBar from '@/components/layout/navigation-bar';
import TabNavigation from '@/components/layout/tab-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';
import AssistantMessage from '@/components/assistant-message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export default function RelationsPage() {
  const { t, currentLanguage } = useLanguage();
  const [relationText, setRelationText] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
  
  // Analyze relationship mutation
  const analyzeRelationshipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/analyze/relationship', {
        text: relationText,
        language: currentLanguage
      });
      return response.json();
    },
    onSuccess: (data: RelationshipAnalysis) => {
      setAnalysis(data);
      setShowAnalysis(true);
    }
  });

  const handleAnalyze = () => {
    if (relationText.trim()) {
      analyzeRelationshipMutation.mutate();
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
            <h2 className="text-2xl font-semibold text-white">Relationship Insights</h2>
            <p className="text-gray-400">Analyze communication patterns and get tips for better interactions.</p>
          </div>
          
          {/* Input Section */}
          <div className="gradient-bg p-4 rounded-xl mb-6">
            <div className="mb-3">
              <h3 className="font-medium">Describe your interaction</h3>
              <p className="text-xs text-gray-400 mt-1">Share a recent conversation or describe the relationship dynamic you'd like to analyze.</p>
            </div>
            
            <Textarea 
              value={relationText}
              onChange={(e) => setRelationText(e.target.value)}
              className="w-full bg-dark-700 text-gray-100 rounded-lg p-3 h-32 focus:outline-none focus:ring-1 focus:ring-primary-400 placeholder-gray-500"
              placeholder="Describe a recent conversation or relationship dynamic..."
            />
            
            <Button 
              className="w-full mt-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition text-white font-medium"
              onClick={handleAnalyze}
              disabled={analyzeRelationshipMutation.isPending || !relationText.trim()}
            >
              {analyzeRelationshipMutation.isPending ? 'Analyzing...' : 'Analyze Relationship'}
            </Button>
          </div>
          
          {/* AI Analysis */}
          {showAnalysis && analysis && (
            <div className="mb-6 space-y-4">
              <AssistantMessage message="I've analyzed the relationship dynamic you described. Here's what I've found:" />
              
              <div className="gradient-bg p-4 rounded-xl">
                <h3 className="font-medium mb-3">Relationship Insights</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Compatibility</span>
                    <span className="text-sm text-gray-300">{analysis.compatibilityScore}%</span>
                  </div>
                  <Progress value={analysis.compatibilityScore} className="h-2 bg-dark-700" />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Communication Quality</span>
                    <span className="text-sm text-gray-300">{analysis.communicationQuality}%</span>
                  </div>
                  <Progress value={analysis.communicationQuality} className="h-2 bg-dark-700" />
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">Relationship Strengths</h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                        <span className="material-icons text-secondary-400 text-sm">check_circle</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">Areas to Improve</h4>
                  <ul className="space-y-2">
                    {analysis.areasToImprove.map((area, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                        <span className="material-icons text-primary-400 text-sm">priority_high</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="gradient-bg p-4 rounded-xl">
                <h3 className="font-medium mb-3">Communication Tips</h3>
                <div className="space-y-3">
                  {analysis.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="material-icons text-secondary-400 mt-0.5">tips_and_updates</span>
                      <p className="text-sm text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Relationship Types */}
          <div className="gradient-bg p-4 rounded-xl mb-6">
            <h3 className="font-medium mb-3">Relationship Types</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="p-3 text-left flex items-center space-x-2 h-auto bg-dark-700 hover:bg-dark-600 border-0">
                <span className="material-icons text-primary-400">favorite</span>
                <div>
                  <span className="block text-sm font-medium">Romantic</span>
                  <span className="block text-xs text-gray-400">Partner, spouse</span>
                </div>
              </Button>
              <Button variant="outline" className="p-3 text-left flex items-center space-x-2 h-auto bg-dark-700 hover:bg-dark-600 border-0">
                <span className="material-icons text-primary-400">family_restroom</span>
                <div>
                  <span className="block text-sm font-medium">Family</span>
                  <span className="block text-xs text-gray-400">Parents, siblings</span>
                </div>
              </Button>
              <Button variant="outline" className="p-3 text-left flex items-center space-x-2 h-auto bg-dark-700 hover:bg-dark-600 border-0">
                <span className="material-icons text-primary-400">groups</span>
                <div>
                  <span className="block text-sm font-medium">Friendship</span>
                  <span className="block text-xs text-gray-400">Friends, peers</span>
                </div>
              </Button>
              <Button variant="outline" className="p-3 text-left flex items-center space-x-2 h-auto bg-dark-700 hover:bg-dark-600 border-0">
                <span className="material-icons text-primary-400">business</span>
                <div>
                  <span className="block text-sm font-medium">Professional</span>
                  <span className="block text-xs text-gray-400">Colleagues, boss</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/languages';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AssistantMessage from '@/components/assistant-message';

export default function BottomNavigation() {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // Simulating a delay for the response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAssistantResponse(
        "I hear you! Thanks for sharing that with me. I'm all ears if you want to chat more about how you're feeling. Sometimes just talking things through can make a world of difference. Would you like to dive deeper into what you're experiencing, or should we explore some ways to help you feel better?"
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-600 p-2">
        <Button 
          className="flex items-center justify-center space-x-2 w-full py-6 rounded-xl bg-primary-600 hover:bg-primary-700 transition"
          onClick={() => setChatOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{t('talkToSanasa')}</span>
        </Button>
      </div>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="bg-dark-800 border-dark-600 p-0 max-w-lg sm:w-full mx-auto h-[80vh] flex flex-col">
          <div className="p-4 border-b border-dark-600 flex items-center">
            <div className="assistant-gradient rounded-full p-1 assistant-bubble mr-3">
              <div className="bg-dark-800 rounded-full p-1">
                <span className="material-icons text-xl">emoji_emotions</span>
              </div>
            </div>
            <h2 className="text-xl font-medium">Dilshani / CalmMind</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AssistantMessage message={
              "Hey there! I'm Dilshani, your friend on this journey. How are you feeling today? I'm here to chat about whatever's on your mind."
            } />
            
            {assistantResponse && (
              <>
                <div className="bg-dark-700 text-gray-300 p-3 rounded-lg rounded-br-none ml-auto max-w-[80%]">
                  {message}
                </div>
                <AssistantMessage message={assistantResponse} />
              </>
            )}
            
            {loading && <div className="flex justify-center"><span className="loading">...</span></div>}
          </div>
          
          <div className="p-4 border-t border-dark-600 flex">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[60px] bg-dark-700 border-dark-600 focus:border-primary-500 resize-none"
            />
            <Button 
              className="ml-2 bg-primary-600 hover:bg-primary-700"
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

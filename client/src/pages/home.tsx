import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/languages';

export default function Home() {
  const [_, setLocation] = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // Redirect to the mood page after a brief introduction
    const timeout = setTimeout(() => {
      setLocation('/mood');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="assistant-gradient inline-block rounded-full p-5 mb-6">
          <span className="material-icons text-6xl">psychology</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-white">{t('appName')}</h1>
        <p className="text-xl text-gray-300">{t('aiAssistant')}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Button 
          className="w-full py-6 text-lg rounded-xl bg-primary-600 hover:bg-primary-700 transition"
          onClick={() => setLocation('/mood')}
        >
          {t('getStarted')}
        </Button>
      </motion.div>
    </div>
  );
}

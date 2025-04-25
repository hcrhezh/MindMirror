import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/languages";

interface OnboardingDialogProps {
  onClose: () => void;
}

export default function OnboardingDialog({ onClose }: OnboardingDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gradient-bg border-dark-600">
        <div className="text-center mb-6">
          <motion.div 
            className="assistant-gradient inline-block rounded-full p-3 mb-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="material-icons text-4xl">psychology</span>
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2">{t('welcome')}</h2>
          <p className="text-gray-300">{t('aiAssistant')}</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <motion.div 
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="bg-primary-900 rounded-full p-1.5">
              <span className="material-icons text-primary-200">mood</span>
            </div>
            <div>
              <h3 className="font-medium">{t('trackMood')}</h3>
              <p className="text-sm text-gray-400">{t('aiAnalysis')}</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="bg-primary-900 rounded-full p-1.5">
              <span className="material-icons text-primary-200">psychology</span>
            </div>
            <div>
              <h3 className="font-medium">{t('clarifyThoughts')}</h3>
              <p className="text-sm text-gray-400">{t('anxiousToAction')}</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="bg-primary-900 rounded-full p-1.5">
              <span className="material-icons text-primary-200">self_improvement</span>
            </div>
            <div>
              <h3 className="font-medium">{t('dailyWellness')}</h3>
              <p className="text-sm text-gray-400">{t('personalizedTips')}</p>
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-3">
          <Button className="w-full py-6 rounded-xl bg-primary-600 hover:bg-primary-700 font-medium" onClick={onClose}>
            {t('getStarted')}
          </Button>
          <Button variant="outline" className="w-full py-6 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 border-none" onClick={onClose}>
            {t('learnMore')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { motion } from "framer-motion";

interface AssistantMessageProps {
  message: string;
  emotions?: string;
}

export default function AssistantMessage({ message, emotions }: AssistantMessageProps) {
  return (
    <div className="flex items-start space-x-3">
      <motion.div 
        className="assistant-gradient rounded-full p-1 assistant-bubble"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-dark-800 rounded-full p-1">
          <span className="material-icons text-xl">emoji_emotions</span>
        </div>
      </motion.div>
      <motion.div 
        className="gradient-bg p-4 rounded-xl rounded-tl-none flex-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm font-medium text-primary-200 mb-1">Sanasa</p>
        <p className="text-gray-300">{message}</p>
        {emotions && (
          <p className="text-sm mt-2 text-secondary-400">{emotions}</p>
        )}
      </motion.div>
    </div>
  );
}

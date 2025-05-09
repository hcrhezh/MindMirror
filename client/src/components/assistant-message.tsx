import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AssistantMessageProps {
  message: string;
  emotions?: string;
}

export default function AssistantMessage({ message, emotions }: AssistantMessageProps) {
  // Simulate typing effect for more human-like conversation
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Reset displayed message when a new message comes in
    setDisplayedMessage("");
    setIsTyping(true);
    
    // Calculate a realistic typing speed (faster for short messages, slower for long ones)
    const typingSpeed = Math.max(20, Math.min(70, 200 - message.length / 5));
    
    // Add a small random delay before starting to type (makes it feel more human)
    const startDelay = Math.random() * 300 + 200;
    
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex < message.length) {
          setDisplayedMessage(prev => prev + message[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingSpeed);
      
      return () => clearInterval(typingInterval);
    }, startDelay);
    
    return () => clearTimeout(timeout);
  }, [message]);

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
        <p className="text-sm font-medium text-primary-200 mb-1">Dilshani</p>
        <p className="text-gray-300">
          {displayedMessage}
          {isTyping && <span className="typing-indicator">•••</span>}
        </p>
        {emotions && !isTyping && (
          <p className="text-sm mt-2 text-secondary-400">{emotions}</p>
        )}
      </motion.div>
    </div>
  );
}

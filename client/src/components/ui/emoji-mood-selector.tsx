import { useState, useEffect } from 'react';
import { Mood, MoodEmoji } from '@/types';
import { useLanguage } from '@/lib/languages';

interface EmojiMoodSelectorProps {
  onSelect: (mood: Mood, score: number) => void;
  initialMood?: Mood;
}

export default function EmojiMoodSelector({ onSelect, initialMood }: EmojiMoodSelectorProps) {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(initialMood);
  
  const moods: MoodEmoji[] = [
    { mood: 'very-sad', emoji: '😢', label: t('verySad'), score: 0.1 },
    { mood: 'sad', emoji: '😔', label: t('sad'), score: 0.3 },
    { mood: 'neutral', emoji: '😐', label: t('neutral'), score: 0.5 },
    { mood: 'happy', emoji: '😊', label: t('happy'), score: 0.7 },
    { mood: 'very-happy', emoji: '😄', label: t('veryHappy'), score: 0.9 },
  ];

  useEffect(() => {
    if (initialMood) {
      setSelectedMood(initialMood);
    }
  }, [initialMood]);

  const handleSelect = (mood: MoodEmoji) => {
    setSelectedMood(mood.mood);
    onSelect(mood.mood, mood.score);
  };

  return (
    <div className="gradient-bg p-4 rounded-xl">
      <p className="text-sm text-gray-300 mb-3">{t('selectMood')}:</p>
      <div className="flex justify-between items-center">
        {moods.map((mood) => (
          <div
            key={mood.mood}
            className={`mood-emoji text-center cursor-pointer ${selectedMood === mood.mood ? 'active' : ''}`}
            onClick={() => handleSelect(mood)}
          >
            <div className="text-3xl mb-1">{mood.emoji}</div>
            <div className="text-xs text-gray-400">{mood.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

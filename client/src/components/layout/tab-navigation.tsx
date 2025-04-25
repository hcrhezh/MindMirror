import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/languages';

export default function TabNavigation() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  // Define tabs with their icons, labels, and paths
  const tabs = [
    { icon: 'mood', label: t('mood'), path: '/mood' },
    { icon: 'psychology', label: t('thoughts'), path: '/thoughts' },
    { icon: 'favorite', label: t('relations'), path: '/relations' },
    { icon: 'self_improvement', label: t('dailyTips'), path: '/daily-tips' },
  ];

  // Update active tab based on current location
  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.path === location);
    setActiveTab(tabIndex >= 0 ? tabIndex : 0);
  }, [location, tabs]);

  return (
    <div className="flex border-b border-dark-600 bg-dark-800 relative">
      {tabs.map((tab, index) => (
        <Link 
          key={tab.path} 
          href={tab.path}
          className={`flex-1 py-3 text-center font-medium flex flex-col items-center ${
            index === activeTab ? 'text-primary-300' : 'text-gray-500'
          }`}
        >
          <span className="material-icons block mx-auto mb-1">{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
      
      {/* Tab indicator */}
      <div 
        className="tab-indicator absolute bottom-0 left-0 h-0.5 w-1/4 bg-primary-400" 
        style={{ transform: `translateX(${activeTab * 100}%)` }}
      />
    </div>
  );
}

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MoodPage from "@/pages/mood-page";
import ThoughtsPage from "@/pages/thoughts-page";
import RelationsPage from "@/pages/relations-page";
import DailyTipsPage from "@/pages/daily-tips-page";
import { useState, useEffect } from "react";
import OnboardingDialog from "@/components/onboarding-dialog";
import { LanguageProvider } from "@/lib/languages";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mood" component={MoodPage} />
      <Route path="/thoughts" component={ThoughtsPage} />
      <Route path="/relations" component={RelationsPage} />
      <Route path="/daily-tips" component={DailyTipsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('mindmirror_visited');
    if (!hasVisitedBefore) {
      setShowOnboarding(true);
      localStorage.setItem('mindmirror_visited', 'true');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
          {showOnboarding && (
            <OnboardingDialog onClose={() => setShowOnboarding(false)} />
          )}
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

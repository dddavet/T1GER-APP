import React, { useState } from 'react';
import { generateFridaySummary, generateWeekendMissions } from '../services/weekendService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';

export const FridayReview = () => {
  const { appUser } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFridayReview = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      // Mock performance data for now
      const performanceData = { missionsCompleted: 4, totalMissions: 5, xpEarned: 300, failedAudits: 1 };
      
      const summaryText = await generateFridaySummary(performanceData);
      setSummary(summaryText);
      await generateWeekendMissions(appUser.uid, appUser.niche);
    } catch (error) {
      console.error("Failed Friday Review", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-3xl border border-white/5">
      <h2 className="text-xl font-black italic mb-4 text-[#FF6B00]">FRIDAY BOARD MEETING</h2>
      {summary ? (
        <p className="text-zinc-300 font-mono">{summary}</p>
      ) : (
        <button 
          onClick={handleFridayReview}
          disabled={loading}
          className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#FF6B00]/90 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Start Review
        </button>
      )}
    </div>
  );
};

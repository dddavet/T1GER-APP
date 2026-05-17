import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

export const BookInsights = () => {
  const { appUser } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;

    const fetchData = async () => {
      // Fetch book (hardcoded for now)
      const bookRef = doc(db, 'books', '100m-offers');
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        setBook(bookSnap.data());
      }

      // Fetch insights
      let insightsSnapshot = await getDocs(collection(db, 'books', '100m-offers', 'insights'));
      if (insightsSnapshot.empty) {
        // Seed
        const insight = { id: '1', title: 'The Value Equation', summary: 'Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort).', explanation: 'This is the core of everything. If you want to charge more, you must increase the numerator or decrease the denominator. Most people focus on the price, which is the wrong lever. Focus on the value.', criticalAnalysis: { works: 'Great for framing offers.', fails: 'Doesn\'t account for market size.', target: 'Entrepreneurs.' }, exercises: [{ name: 'Value Audit', objective: 'Audit your offer', instructions: 'Write down your offer and apply the equation.', frequency: 'Once', successMetric: 'Value score' }, { name: 'Denominator Reduction', objective: 'Reduce effort', instructions: 'Find one way to make your offer easier to consume.', frequency: 'Weekly', successMetric: 'Effort score' }] };
        await setDoc(doc(db, 'books', '100m-offers', 'insights', '1'), insight);
        insightsSnapshot = await getDocs(collection(db, 'books', '100m-offers', 'insights'));
      }
      setInsights(insightsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.id.localeCompare(b.id)));

      // Fetch progress
      const progressRef = doc(db, 'users', appUser.uid, 'bookProgress', '100m-offers');
      const progressSnap = await getDoc(progressRef);
      if (progressSnap.exists()) {
        setProgress(progressSnap.data());
      } else {
        await setDoc(progressRef, { userId: appUser.uid, bookId: '100m-offers', completedInsights: [], completedExercises: [] });
        setProgress({ completedInsights: [], completedExercises: [] });
      }
      setLoading(false);
    };
    fetchData();
  }, [appUser]);

  const toggleInsight = async (insightId: string) => {
    if (!appUser || !progress) return;
    const progressRef = doc(db, 'users', appUser.uid, 'bookProgress', '100m-offers');
    const isCompleted = progress.completedInsights.includes(insightId);
    if (isCompleted) {
      // Remove
      await updateDoc(progressRef, {
        completedInsights: progress.completedInsights.filter((id: string) => id !== insightId)
      });
      setProgress({...progress, completedInsights: progress.completedInsights.filter((id: string) => id !== insightId)});
    } else {
      // Add
      await updateDoc(progressRef, {
        completedInsights: arrayUnion(insightId)
      });
      setProgress({...progress, completedInsights: [...progress.completedInsights, insightId]});
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!book || insights.length === 0) return <div className="text-white">No insights found.</div>;

  const insight = insights[currentIndex];

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-3xl font-black font-sans uppercase">{book.title}</h1>
      <div className="flex justify-between items-center">
        <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}><ChevronLeft /></button>
        <span className="font-mono text-sm">{currentIndex + 1} / {insights.length}</span>
        <button onClick={() => setCurrentIndex(Math.min(insights.length - 1, currentIndex + 1))} disabled={currentIndex === insights.length - 1}><ChevronRight /></button>
      </div>

      <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black font-sans uppercase">{insight.title}</h2>
          <button onClick={() => toggleInsight(insight.id)}>
            {progress.completedInsights.includes(insight.id) ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-zinc-600" />}
          </button>
        </div>
        <p className="text-zinc-400 font-mono text-sm">{insight.summary}</p>
        <p className="text-zinc-300 font-mono text-sm">{insight.explanation}</p>
      </div>

      <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-xl font-black font-sans uppercase">Exercises</h3>
        {insight.exercises.map((exercise: any, i: number) => (
          <div key={i} className="bg-zinc-900 p-4 rounded-xl space-y-2 border border-zinc-800">
            <h4 className="font-bold">{exercise.name}</h4>
            <p className="text-sm text-zinc-400">{exercise.objective}</p>
            <p className="text-sm text-zinc-300">{exercise.instructions}</p>
            <p className="text-xs text-zinc-500 font-mono">{exercise.frequency} - Metric: {exercise.successMetric}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-xl font-black font-sans uppercase">Critical Analysis</h3>
        <p className="text-sm text-zinc-400">Works: {insight.criticalAnalysis.works}</p>
        <p className="text-sm text-zinc-400">Fails: {insight.criticalAnalysis.fails}</p>
        <p className="text-sm text-zinc-400">Target: {insight.criticalAnalysis.target}</p>
      </div>
    </div>
  );
};

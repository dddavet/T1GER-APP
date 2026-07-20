import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface PredatorReport {
  userId: string;
  startDate: Date;
  endDate: Date;
  totalCompletedMissions: number;
  xpEarned: number;
  streakStatus: {
    currentStreak: number;
    streakGrowth: number; // calculado relativo a misiones completadas esta semana
  };
  reflectionsCount: number;
  byCategory: { [category: string]: number };
  recentMissions: Array<{
    id: string;
    title: string;
    completedAt: Date;
    reflection?: string;
    xpReward?: number;
    category?: string;
  }>;
}

export const generateWeeklyReport = async (userId: string, currentStreak: number): Promise<PredatorReport> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  try {
    const q = query(
      collection(db, 'missions'),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(q);
    const completedThisWeek: any[] = [];
    let xpEarned = 0;
    const byCategory: { [category: string]: number } = {};
    let reflectionsCount = 0;

    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const completedAtDate = data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt || Date.now());
      
      if (completedAtDate >= startDate && completedAtDate <= endDate) {
        completedThisWeek.push({
          id: docSnap.id,
          title: data.title || 'Misión sin título',
          completedAt: completedAtDate,
          reflection: data.reflection,
          xpReward: data.xpReward || 20,
          category: data.type || 'General'
        });

        xpEarned += (data.xpReward || 20);
        
        const cat = data.type || 'General';
        byCategory[cat] = (byCategory[cat] || 0) + 1;

        if (data.reflection && data.reflection !== 'Completado sin reflexión.') {
          reflectionsCount++;
        }
      }
    });

    // Ordenar por más reciente
    completedThisWeek.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    // Heurística de crecimiento del streak sobre 7 días
    const completedCount = completedThisWeek.length;
    const streakGrowth = completedCount >= 5 ? 7 : completedCount;

    return {
      userId,
      startDate,
      endDate,
      totalCompletedMissions: completedCount,
      xpEarned,
      streakStatus: {
        currentStreak,
        streakGrowth
      },
      reflectionsCount,
      byCategory,
      recentMissions: completedThisWeek
    };
  } catch (error) {
    console.error('Error generating Predator Report:', error);
    return {
      userId,
      startDate,
      endDate,
      totalCompletedMissions: 0,
      xpEarned: 0,
      streakStatus: { currentStreak, streakGrowth: 0 },
      reflectionsCount: 0,
      byCategory: {},
      recentMissions: []
    };
  }
};

export const setWeeklyReportOptIn = async (userId: string, optIn: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      weeklyReportOptIn: optIn
    });
    console.log(`[Predator Report] Updated weeklyReportOptIn for user ${userId} to ${optIn}`);
  } catch (error) {
    console.error('Error updating report opt-in flag:', error);
    throw error;
  }
};

export const sendMockWeeklyReportEmail = (email: string, report: PredatorReport) => {
  console.log(`[EMAIL SEND] Preparing weekly automated summary email for ${email}...`);
  console.log(`
  ----------------- PREDATOR REPORT WEEKLY EMAIL -----------------
  To: ${email}
  Subject: Your Weekly T1GER Predator Performance Report is Ready 🐅

  Hello Apex Entrepreneur,

  Here is your compound growth breakdown for the past 7 days:
  
  🔥 STREAK STATUS: ${report.streakStatus.currentStreak} Days Active (Streak Growth: +${report.streakStatus.streakGrowth}D)
  🎯 MISSIONS COMPLETED: ${report.totalCompletedMissions} Missions Executed
  ⚡ XP ACCUMULATED: +${report.xpEarned} XP
  💡 LEARNING INSIGHTS: Logged ${report.reflectionsCount} Quick Reflections

  COMPETENCY CATEGORIES COMPLETED:
  ${Object.entries(report.byCategory).map(([cat, val]) => ` - ${cat}: ${val} completed`).join('\n')}

  RECENT ACHIEVEMENTS & REFLECTIONS:
  ${report.recentMissions.slice(0, 3).map(m => ` • [${m.category}] ${m.title}
     Reflection: "${m.reflection || 'No reflection logged.'}"`).join('\n\n')}

  Continue dominating. Compounding occurs in daily focus.
  
  - T1GER AI Protocol
  -----------------------------------------------------------------
  `);
};

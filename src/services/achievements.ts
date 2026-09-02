export interface Achievement {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  condition: (user: any, stats: any, brainState: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'Primera sangre', nameEn: 'First proof', description: 'Completa tu primera misión táctica.', descriptionEn: 'Complete your first tactical mission.', icon: '🩸', color: 'from-rose-500 to-red-600', condition: (_, __, brainState) => (brainState?.missionHistory?.length || 0) > 0 },
  { id: 'streak_3', name: 'Disciplina base', nameEn: 'Base discipline', description: 'Alcanza 3 días de racha consecutivos.', descriptionEn: 'Reach a three-day streak.', icon: '🔥', color: 'from-orange-500 to-amber-500', condition: (_, __, brainState) => brainState?.learnStreak >= 3 },
  { id: 'streak_7', name: 'Semana titán', nameEn: 'Titan week', description: 'Siete días seguidos forjando el hábito.', descriptionEn: 'Build the habit for seven straight days.', icon: '⚡', color: 'from-emerald-400 to-teal-500', condition: (_, __, brainState) => brainState?.learnStreak >= 7 },
  { id: 'rich_kid', name: 'Capitalista', nameEn: 'Capital builder', description: 'Acumula más de 10,000 monedas.', descriptionEn: 'Accumulate more than 10,000 coins.', icon: '💰', color: 'from-yellow-400 to-yellow-600', condition: user => (user?.coins || 0) >= 10000 },
  { id: 'shopaholic', name: 'Dueño del mercado', nameEn: 'Market owner', description: 'Compra tu primer aspecto en el Mercado Negro.', descriptionEn: 'Buy your first Black Market cosmetic.', icon: '💎', color: 'from-purple-500 to-fuchsia-500', condition: user => (user?.unlockedAccessories?.length || 0) > 0 },
  { id: 'night_owl', name: 'Búho nocturno', nameEn: 'Night owl', description: 'Entrena después de las 10:00 PM.', descriptionEn: 'Train after 10:00 PM.', icon: '🦉', color: 'from-indigo-500 to-blue-600', condition: () => new Date().getHours() >= 22 || new Date().getHours() <= 3 },
];

export const checkAchievements = (appUser: any, stats: any, brainState: any): string[] => {
  if (!appUser) return [];
  const newlyUnlocked: string[] = [];
  const currentUnlocked = appUser.unlockedAchievements || [];
  for (const achievement of ACHIEVEMENTS) {
    if (!currentUnlocked.includes(achievement.id) && achievement.condition(appUser, stats, brainState)) newlyUnlocked.push(achievement.id);
  }
  return newlyUnlocked;
};

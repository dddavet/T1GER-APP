export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (user: any, stats: any, brainState: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'Primera Sangre',
    description: 'Completa tu primera misión táctica.',
    icon: '🩸',
    color: 'from-rose-500 to-red-600',
    condition: (_, stats) => stats?.missionsCompleted > 0
  },
  {
    id: 'streak_3',
    name: 'Disciplina Base',
    description: 'Alcanza 3 días de racha consecutivos.',
    icon: '🔥',
    color: 'from-orange-500 to-amber-500',
    condition: (_, __, brainState) => brainState?.learnStreak >= 3
  },
  {
    id: 'streak_7',
    name: 'Semana Titán',
    description: '7 días seguidos forjando el hábito.',
    icon: '⚡',
    color: 'from-emerald-400 to-teal-500',
    condition: (_, __, brainState) => brainState?.learnStreak >= 7
  },
  {
    id: 'rich_kid',
    name: 'Capitalista',
    description: 'Acumula más de 10,000 Monedas.',
    icon: '💰',
    color: 'from-yellow-400 to-yellow-600',
    condition: (user) => (user?.coins || 0) >= 10000
  },
  {
    id: 'shopaholic',
    name: 'Dueño del Mercado',
    description: 'Compra tu primer aspecto en el Mercado Negro.',
    icon: '💎',
    color: 'from-purple-500 to-fuchsia-500',
    condition: (user) => (user?.unlockedAccessories?.length || 0) > 0
  },
  {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: 'Entrena después de las 10:00 PM.',
    icon: '🦉',
    color: 'from-indigo-500 to-blue-600',
    condition: () => new Date().getHours() >= 22 || new Date().getHours() <= 3
  }
];

export const checkAchievements = (appUser: any, stats: any, brainState: any): string[] => {
  if (!appUser) return [];
  const newlyUnlocked: string[] = [];
  const currentUnlocked = appUser.unlockedAchievements || [];

  for (const ach of ACHIEVEMENTS) {
    if (!currentUnlocked.includes(ach.id) && ach.condition(appUser, stats, brainState)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
};

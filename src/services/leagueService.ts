import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'amber' | 'obsidian';

export interface LeagueTierConfig {
  id: LeagueTier;
  nameEs: string;
  nameEn: string;
  minXP: number;
  badge: string;
  color: string;
  glow: string;
  rewards: {
    first: { gems: number; xp: number; title: string };
    second: { gems: number; xp: number; title: string };
    third: { gems: number; xp: number; title: string };
  };
}

export const LEAGUE_TIERS: Record<LeagueTier, LeagueTierConfig> = {
  bronze: {
    id: 'bronze',
    nameEs: 'Liga Bronce',
    nameEn: 'Bronze League',
    minXP: 0,
    badge: '🥉',
    color: '#CD7F32',
    glow: 'rgba(205, 127, 50, 0.3)',
    rewards: {
      first: { gems: 100, xp: 200, title: 'Campeón de Bronce' },
      second: { gems: 60, xp: 120, title: 'Subcampeón de Bronce' },
      third: { gems: 30, xp: 80, title: 'Tercer Puesto' },
    },
  },
  silver: {
    id: 'silver',
    nameEs: 'Liga Plata',
    nameEn: 'Silver League',
    minXP: 250,
    badge: '🥈',
    color: '#E0E0E0',
    glow: 'rgba(224, 224, 224, 0.3)',
    rewards: {
      first: { gems: 150, xp: 300, title: 'Campeón de Plata' },
      second: { gems: 90, xp: 180, title: 'Subcampeón de Plata' },
      third: { gems: 50, xp: 100, title: 'Tercer Puesto' },
    },
  },
  gold: {
    id: 'gold',
    nameEs: 'Liga Oro',
    nameEn: 'Gold League',
    minXP: 600,
    badge: '🥇',
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.35)',
    rewards: {
      first: { gems: 250, xp: 450, title: 'Campeón de Oro' },
      second: { gems: 150, xp: 250, title: 'Subcampeón de Oro' },
      third: { gems: 80, xp: 150, title: 'Tercer Puesto' },
    },
  },
  amber: {
    id: 'amber',
    nameEs: 'Liga Ámbar',
    nameEn: 'Amber League',
    minXP: 1200,
    badge: '🔶',
    color: '#FF7300',
    glow: 'rgba(255, 115, 0, 0.4)',
    rewards: {
      first: { gems: 400, xp: 600, title: 'Maestro Ámbar' },
      second: { gems: 250, xp: 350, title: 'Subcampeón Ámbar' },
      third: { gems: 120, xp: 200, title: 'Tercer Puesto' },
    },
  },
  obsidian: {
    id: 'obsidian',
    nameEs: 'Liga Obsidiana',
    nameEn: 'Obsidian League',
    minXP: 2500,
    badge: '💎',
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.45)',
    rewards: {
      first: { gems: 1000, xp: 1200, title: 'Gran Titán Obsidiana' },
      second: { gems: 600, xp: 750, title: 'Subcampeón Obsidiana' },
      third: { gems: 350, xp: 400, title: 'Tercer Puesto Élite' },
    },
  },
};

export interface LeagueMember {
  id: string;
  uid?: string;
  name: string;
  avatar: string;
  niche: string;
  vXP: number;
  streak: number;
  isCurrentUser?: boolean;
  cheersReceived?: number;
  lastActiveFormatted?: string;
}

// Highly calibrated cohort realistic peer competitors across business & investing
const COHORT_SEEDS: Array<Omit<LeagueMember, 'id' | 'isCurrentUser'>> = [
  { name: 'Valeria M.', avatar: '⚡', niche: 'SaaS B2B', vXP: 480, streak: 12, lastActiveFormatted: 'Hace 8m' },
  { name: 'Carlos R.', avatar: '🎯', niche: 'E-commerce', vXP: 420, streak: 9, lastActiveFormatted: 'Hace 22m' },
  { name: 'Sofia T.', avatar: '💎', niche: 'Fintech & AI', vXP: 360, streak: 14, lastActiveFormatted: 'Hace 1h' },
  { name: 'Mateo G.', avatar: '🚀', niche: 'Agencia Growth', vXP: 310, streak: 6, lastActiveFormatted: 'Hace 2h' },
  { name: 'Daniela V.', avatar: '🔥', niche: 'Bienes Raíces', vXP: 275, streak: 8, lastActiveFormatted: 'Hace 3h' },
  { name: 'Lucas B.', avatar: '🧠', niche: 'Ventas B2B', vXP: 240, streak: 5, lastActiveFormatted: 'Hace 4h' },
  { name: 'Ana P.', avatar: '🌟', niche: 'Infoproductos', vXP: 210, streak: 4, lastActiveFormatted: 'Hace 5h' },
  { name: 'Alejandro K.', avatar: '📈', niche: 'Trading & Equity', vXP: 190, streak: 7, lastActiveFormatted: 'Hace 6h' },
  { name: 'Elena D.', avatar: '🛡️', niche: 'Consultoría', vXP: 170, streak: 3, lastActiveFormatted: 'Hace 7h' },
  { name: 'Nicolás S.', avatar: '⚙️', niche: 'Operaciones', vXP: 155, streak: 5, lastActiveFormatted: 'Hace 8h' },
  { name: 'Camila H.', avatar: '💡', niche: 'Marketing Directo', vXP: 140, streak: 2, lastActiveFormatted: 'Hace 10h' },
  { name: 'Sebastián Z.', avatar: '📊', niche: 'Inversión Privada', vXP: 125, streak: 4, lastActiveFormatted: 'Hace 12h' },
  { name: 'Martina F.', avatar: '🏹', niche: 'Ofertas Hormozi', vXP: 110, streak: 3, lastActiveFormatted: 'Hace 14h' },
  { name: 'Javier O.', avatar: '🤝', niche: 'Copywriting', vXP: 95, streak: 2, lastActiveFormatted: 'Hace 18h' },
  { name: 'Lucía G.', avatar: '🧭', niche: 'Startups', vXP: 80, streak: 1, lastActiveFormatted: 'Ayer' },
  { name: 'Gabriel M.', avatar: '🐅', niche: 'Logística', vXP: 65, streak: 2, lastActiveFormatted: 'Ayer' },
  { name: 'Valentina C.', avatar: '🔮', niche: 'Automatización IA', vXP: 50, streak: 1, lastActiveFormatted: 'Ayer' },
  { name: 'Tomás R.', avatar: '⚓', niche: 'Finanzas Corporativas', vXP: 35, streak: 1, lastActiveFormatted: 'Hace 2d' },
  { name: 'Isabella N.', avatar: '🧬', niche: 'Biotech & Health', vXP: 25, streak: 0, lastActiveFormatted: 'Hace 2d' },
  { name: 'Diego L.', avatar: '🔋', niche: 'Energía & Hardtech', vXP: 15, streak: 0, lastActiveFormatted: 'Hace 3d' },
];

export class LeagueService {
  /**
   * Computes the current week identifier (e.g. "2026-W34")
   */
  static getCurrentWeekId(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  /**
   * Calculates time remaining until Sunday 23:59:59 UTC
   */
  static getTimeRemaining(): { hours: number; minutes: number; formatted: string } {
    const now = new Date();
    const endOfWeek = new Date();
    const day = now.getUTCDay();
    const diff = (7 - day) % 7; // days until next Sunday
    
    endOfWeek.setUTCDate(now.getUTCDate() + (diff === 0 && now.getUTCHours() >= 23 ? 7 : diff));
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const totalSeconds = Math.max(0, Math.floor((endOfWeek.getTime() - now.getTime()) / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const formatted = days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
    return { hours, minutes, formatted };
  }

  /**
   * Determines user's current League Tier based on accumulated verified XP or rank history
   */
  static getUserTier(totalVerifiedXP: number): LeagueTier {
    if (totalVerifiedXP >= 2500) return 'obsidian';
    if (totalVerifiedXP >= 1200) return 'amber';
    if (totalVerifiedXP >= 600) return 'gold';
    if (totalVerifiedXP >= 250) return 'silver';
    return 'bronze';
  }

  static async getCohortLeaderboard(currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
    verifiedXP: number;
    weeklyXP?: number;
    currentWeekId?: string;
    leagueTier?: string;
    streak: number;
    niche?: string;
  }): Promise<LeagueMember[]> {
    const members: LeagueMember[] = [];
    const currentWeek = this.getCurrentWeekId();
    const userTier = currentUser.leagueTier || this.getUserTier(currentUser.verifiedXP);

    // 1. Try to fetch real public users from Firestore
    try {
      if (db) {
        // Query top active users globally, then filter by tier locally
        const q = query(
          collection(db, 'users_public'), 
          orderBy('weeklyXP', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.uid !== currentUser.uid && data.displayName) {
            // Filter locally by tier and active week
            const theirTier = data.leagueTier || 'bronze';
            if (theirTier === userTier) {
              const theirWeek = data.currentWeekId;
              const theirWeeklyXP = theirWeek === currentWeek ? (Number(data.weeklyXP) || 0) : 0;
              
              members.push({
                id: `user-${data.uid}`,
                uid: data.uid,
                name: data.displayName,
                avatar: data.photoURL || '🐅',
                niche: data.niche || 'Emprendedor',
                vXP: theirWeeklyXP,
                streak: Number(data.streak) || 0,
                lastActiveFormatted: 'Reciente',
              });
            }
          }
        });
      }
    } catch {
      // Offline fallback
    }

    // 2. Supplement with realistic cohort seeds to maintain a competitive 20-30 user bracket
    COHORT_SEEDS.forEach((seed, idx) => {
      if (members.length < 29) {
        members.push({
          id: `seed-${idx}`,
          name: seed.name,
          avatar: seed.avatar,
          niche: seed.niche,
          vXP: seed.vXP, // using their hardcoded vXP as weekly proxy
          streak: seed.streak,
          lastActiveFormatted: seed.lastActiveFormatted,
        });
      }
    });

    // 3. Inject Current User with live real-time score
    const userWeeklyXP = currentUser.currentWeekId === currentWeek ? (currentUser.weeklyXP || 0) : 0;
    members.push({
      id: `current-user-${currentUser.uid}`,
      uid: currentUser.uid,
      name: currentUser.displayName || 'Tú',
      avatar: currentUser.photoURL || '🐅',
      niche: currentUser.niche || 'Fundador',
      vXP: userWeeklyXP,
      streak: currentUser.streak,
      isCurrentUser: true,
      lastActiveFormatted: 'Ahora',
    });

    // 4. Sort strictly descending by Weekly XP (+vXP)
    members.sort((a, b) => b.vXP - a.vXP);

    return members;
  }
}

import { LeagueHeader } from './LeagueHeader';
import { FriendActivity } from './FriendActivity';
import { PackQuest } from './PackQuest';
import { WeeklyBoard } from './WeeklyBoard';
import { InviteBanner } from './InviteBanner';

export const SquadTab = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* 1. League Status — The #1 Duolingo hook */}
      <LeagueHeader />

      {/* 2. Friend Activity — Social proof */}
      <FriendActivity />

      {/* 3. Pack Quest — Shared goals */}
      <PackQuest />

      {/* 4. Weekly Board — Competition */}
      <WeeklyBoard />

      {/* 5. Invite — Growth */}
      <InviteBanner />
    </div>
  );
};

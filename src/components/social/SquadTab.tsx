import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { EmptyState } from '../ui/EmptyState';
import { Users } from 'lucide-react';

export const SquadTab = () => {
  const { language } = useBrain();
  const { setActiveView } = useT1ger();
  const isEs = language === 'es';

  return (
    <div className="h-full pt-12 pb-24">
      <EmptyState 
        icon={Users}
        title={isEs ? "Añade a tu Squad" : "Build Your Squad"}
        description={isEs ? "Añade amigos para competir en ligas y ver su actividad." : "Add friends to compete in leagues and track their activity."}
        actionLabel={isEs ? "Buscar Amigos" : "Find Friends"}
        onAction={() => setActiveView('profile')} 
      />
    </div>
  );
};

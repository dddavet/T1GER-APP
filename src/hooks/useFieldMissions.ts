import { useEffect, useState } from 'react';
import { FIELD_MISSION_EVENT, FieldMissionService } from '../services/fieldMissionService';
export function useFieldMissions(userId: string) {
  const [missions, setMissions] = useState(() => FieldMissionService.list(userId));
  useEffect(() => {
    const refresh = () => setMissions(FieldMissionService.list(userId));
    refresh();
    window.addEventListener(FIELD_MISSION_EVENT, refresh);
    const unsubscribe = FieldMissionService.subscribe(userId);
    return () => { unsubscribe(); window.removeEventListener(FIELD_MISSION_EVENT, refresh); };
  }, [userId]);
  return missions;
}

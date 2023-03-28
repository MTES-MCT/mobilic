import React from "react";
import { computeMissionStats } from "common/utils/mission";
import { useAdminStore } from "../store/store";

export function useMissionWithStats(mission) {
  const adminStore = useAdminStore();

  const [missionWithStats, setMissionWithStats] = React.useState(null);

  React.useEffect(() => {
    if (mission)
      setMissionWithStats(
        computeMissionStats(mission, adminStore.validationsFilters?.users)
      );
  }, [mission]);

  return missionWithStats;
}

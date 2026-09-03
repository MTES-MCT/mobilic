import React from "react";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "./Snackbar";
import {
  getMissionActivityEvents,
  getEventTagType,
  useCacheContradictoryInfoInPwaStore
} from "common/utils/contradictory";

// Tells whether a mission's activities were added, edited, or deleted
// after the fact, rather than tracked live ("AJOUT" | "MODIFICATION" | "SUPPRESSION" | null).
export const useLastMissionEditType = (mission) => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const cacheContradictoryInfoInStore = useCacheContradictoryInfoInPwaStore();
  const [editType, setEditType] = React.useState(null);

  React.useEffect(() => {
    if (!mission) {
      setEditType(null);
      return;
    }
    let cancelled = false;
    alerts.withApiErrorHandling(async () => {
      const { activityEvents } = await getMissionActivityEvents(
        mission,
        api,
        cacheContradictoryInfoInStore
      );
      if (!cancelled) setEditType(getEventTagType(activityEvents));
    }, "last-mission-edit-type");
    return () => {
      cancelled = true;
    };
  }, [mission, api, cacheContradictoryInfoInStore]);

  return { editType, hasBeenEdited: Boolean(editType) };
};

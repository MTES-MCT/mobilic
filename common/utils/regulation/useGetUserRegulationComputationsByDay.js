import React from "react";
import { useSnackbarAlerts } from "../../../web/common/Snackbar";
import { useApi } from "../api";
import { ME_READ_REGULATION_COMPUTATIONS_QUERY } from "../apiQueries";
import { useLoadingScreen } from "../loading";
import { DAY, now } from "../time";
import { computeNumberOfAlerts } from "./computeNumberOfAlerts";

export const useGetUserRegulationComputationsByDay = () => {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const [
    regulationComputationsByDay,
    setRegulationComputationsByDay
  ] = React.useState([]);
  React.useEffect(() => {
    withLoadingScreen(async () => {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlMutate(
          ME_READ_REGULATION_COMPUTATIONS_QUERY,
          {
            fromDate: now() - DAY * 215
          },
          { context: { nonPublicApi: false } }
        );

        setRegulationComputationsByDay(
          apiResponse.data.me.regulationComputationsByDay
        );
      });
    });
  }, []);

  const alertNumber = React.useMemo(() => {
    if (!regulationComputationsByDay) {
      return 0;
    }
    return computeNumberOfAlerts(regulationComputationsByDay);
  }, [regulationComputationsByDay]);

  return [regulationComputationsByDay, alertNumber];
};

import React from "react";
import { useSnackbarAlerts } from "../../../web/common/Snackbar";
import { useApi } from "../api";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "../apiQueries";
import { useLoadingScreen } from "../loading";
import { DEFAULT_NB_DAYS_MISSIONS_HISTORY } from "../mission";
import { DAY, isoFormatLocalDate, now } from "../time";
import { computeNumberOfAlerts } from "./computeNumberOfAlerts";

const queryUserRegulationComputations = async (api, payload) => {
  const apiResponse = await api.graphQlQuery(
    USER_READ_REGULATION_COMPUTATIONS_QUERY,
    payload
  );
  return apiResponse;
};

export const getRegulationComputationsAndAlertsNumber = async (api, userId) => {
  const apiResponse = await queryUserRegulationComputations(api, {
    userId,
    fromDate: isoFormatLocalDate(now() - DAY * DEFAULT_NB_DAYS_MISSIONS_HISTORY)
  });

  const { regulationComputationsByDay } = apiResponse?.data?.user;

  let alertsNumber = 0;
  if (regulationComputationsByDay) {
    alertsNumber = computeNumberOfAlerts(regulationComputationsByDay);
  }
  return { regulationComputationsByDay, alertsNumber };
};

export const useGetUserRegulationComputationsByDay = userId => {
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
        const apiResponse = await getRegulationComputationsAndAlertsNumber(
          api,
          userId
        );
        if (apiResponse.regulationComputationsByDay) {
          setRegulationComputationsByDay(
            apiResponse.regulationComputationsByDay
          );
        }
      });
    });
  }, []);

  return regulationComputationsByDay;
};

export const useGetUserRegulationComputationsForDate = (
  userId,
  date,
  setLoading
) => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [regulationComputations, setRegulationComputations] = React.useState(
    []
  );
  React.useEffect(async () => {
    await alerts.withApiErrorHandling(async () => {
      setLoading(true);
      const apiResponse = await api.graphQlQuery(
        USER_READ_REGULATION_COMPUTATIONS_QUERY,
        {
          userId,
          fromDate: date,
          toDate: date
        }
      );
      const { regulationComputationsByDay } = apiResponse.data.user;
      if (regulationComputationsByDay.length !== 1) {
        setRegulationComputations([]);
      } else {
        setRegulationComputations(
          regulationComputationsByDay[0].regulationComputations
        );
        setLoading(false);
      }
    });
  }, []);

  return regulationComputations;
};

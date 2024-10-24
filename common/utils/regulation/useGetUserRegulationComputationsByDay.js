import React from "react";
import { useSnackbarAlerts } from "../../../web/common/Snackbar";
import { useApi } from "../api";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "../apiQueries";
import { isoFormatLocalDate } from "../time";
import { computeNumberOfAlerts } from "./computeNumberOfAlerts";

const queryUserRegulationComputations = async (api, payload) => {
  const apiResponse = await api.graphQlQuery(
    USER_READ_REGULATION_COMPUTATIONS_QUERY,
    payload
  );
  return apiResponse;
};

export const getRegulationComputationsAndAlertNumber = async (
  api,
  userId,
  fromDate
) => {
  const apiResponse = await queryUserRegulationComputations(api, {
    userId,
    fromDate: isoFormatLocalDate(fromDate)
  });

  const { regulationComputationsByDay } = apiResponse?.data?.user;

  let alertNumber = 0;
  if (regulationComputationsByDay) {
    alertNumber = computeNumberOfAlerts(regulationComputationsByDay);
  }
  return { regulationComputationsByDay, alertNumber };
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
  React.useEffect(() => {
    const loadData = async () => {
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
        }
        setLoading(false);
      });
    };
    loadData();
  }, []);

  return regulationComputations;
};

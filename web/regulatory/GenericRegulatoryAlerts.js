import React from "react";
import { renderRegulationCheck } from "./RegulatoryAlertRender";
import {
  RegulatoryTextDayBeforeAndAfter,
  RegulatoryTextNotCalculatedYet,
  RegulatoryTextWeekBeforeAndAfter
} from "./RegulatoryText";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../common/Snackbar";
import Skeleton from "@mui/material/Skeleton";
import {
  getAlertComputationVersion,
  getLatestAlertComputationVersion
} from "common/utils/regulation/alertVersions";
import {
  ALERT_TYPE_PROPS_SIMPLER,
  SubmitterType
} from "common/utils/regulation/alertTypes";
import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import { currentControllerId } from "common/utils/cookie";
import { Typography } from "@mui/material";

export function GenericRegulatoryAlerts({
  userId,
  day,
  prefetchedRegulationComputation,
  regulationCheckUnit,
  shouldDisplayInitialEmployeeVersion = false
}) {
  const [regulationComputations, setRegulationComputations] = React.useState(
    []
  );
  const [loading, setLoading] = React.useState(false);

  const api = useApi();
  const alerts = useSnackbarAlerts();

  React.useEffect(async () => {
    setLoading(true);
    if (currentControllerId()) {
      setRegulationComputations(prefetchedRegulationComputation);
    } else {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlQuery(
          USER_READ_REGULATION_COMPUTATIONS_QUERY,
          {
            userId: userId,
            fromDate: day,
            toDate: day
          }
        );
        const { regulationComputationsByDay } = apiResponse.data.user;
        if (regulationComputationsByDay?.length !== 1) {
          setRegulationComputations(null);
        } else {
          if (shouldDisplayInitialEmployeeVersion) {
            setRegulationComputations(
              getAlertComputationVersion(
                regulationComputationsByDay[0].regulationComputations,
                SubmitterType.EMPLOYEE
              )
            );
          } else {
            setRegulationComputations(
              getLatestAlertComputationVersion(
                regulationComputationsByDay[0].regulationComputations
              )
            );
          }
        }
      });
    }
    setLoading(false);
  }, [
    day,
    userId,
    prefetchedRegulationComputation,
    shouldDisplayInitialEmployeeVersion
  ]);

  return (
    <>
      {loading && <Skeleton variant="rectangular" width="100%" height={300} />}
      {!loading && regulationComputations && (
        <>
          <Typography variant="h6" component="h2">
            Seuils réglementaires
          </Typography>
          {regulationCheckUnit === PERIOD_UNITS.DAY ? (
            <RegulatoryTextDayBeforeAndAfter />
          ) : (
            <RegulatoryTextWeekBeforeAndAfter />
          )}
          {regulationComputations.regulationChecks
            ?.filter(
              regulationCheck =>
                regulationCheck.type in ALERT_TYPE_PROPS_SIMPLER
            )
            ?.filter(
              regulationCheck => regulationCheck.unit === regulationCheckUnit
            )
            .map(regulationCheck => renderRegulationCheck(regulationCheck))}
        </>
      )}
      {!loading && !regulationComputations && (
        <RegulatoryTextNotCalculatedYet />
      )}
    </>
  );
}

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
import { SectionTitle } from "../common/typography/SectionTitle";

export function GenericRegulatoryAlerts({
  userId,
  day,
  regulationCheckUnit,
  shouldDisplayInitialEmployeeVersion = false
}) {
  const [regulationComputations, setRegulationComputations] = React.useState(
    []
  );
  const [loading, setLoading] = React.useState(false);

  const api = useApi();
  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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
      setLoading(false);
    };
    loadData();
  }, [day, userId, shouldDisplayInitialEmployeeVersion]);

  return (
    <>
      <SectionTitle title="Seuils réglementaires" component="h2" />
      {loading && <Skeleton variant="rectangular" width="100%" height={300} />}
      {!loading && regulationComputations && (
        <>
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

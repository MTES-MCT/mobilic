import React, { useMemo } from "react";
import { renderRegulationCheck } from "./RegulatoryAlertRender";
import { RegulatoryTextNotCalculatedYet } from "./RegulatoryText";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../common/Snackbar";
import Skeleton from "@mui/material/Skeleton";
import {
  getAlertComputationVersion,
  getLatestAlertComputationVersion
} from "common/utils/regulation/alertVersions";
import {
  ALERT_TYPE_PROPS_SIMPLER,
  ALERT_TYPES,
  SubmitterType
} from "common/utils/regulation/alertTypes";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "common/utils/apiQueries/user";
import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { NoAlerts } from "./NoAlerts";

const tagsStyles = makeStyles((theme) => ({
  running: {
    color: fr.colors.decisions.background.flat.warning.default,
    backgroundColor: fr.colors.decisions.background.contrast.warning.default
  },
  waiting: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default
  }
}));

const RunningTag = () => {
  const classes = tagsStyles();
  return <Tag className={classes.running}>Mission en cours</Tag>;
};

const WaitingTag = () => {
  const classes = tagsStyles();
  return (
    <Tag className={classes.waiting}>
      En attente de validation par le salarié
    </Tag>
  );
};

export function GenericRegulatoryAlerts({
  userId,
  day,
  stillRunning = false,
  includeWeeklyAlerts = false,
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

  const checksWithAlerts = useMemo(
    () =>
      regulationComputations?.regulationChecks
        ?.filter(
          (regulationCheck) => regulationCheck.type in ALERT_TYPE_PROPS_SIMPLER
        )
        ?.filter((regulationCheck) =>
          includeWeeklyAlerts ? true : regulationCheck.unit === PERIOD_UNITS.DAY
        )
        .filter((regulationCheck) => !!regulationCheck.alert)
        .map((regulationCheck) => ({
          type: regulationCheck.type,
          rule: regulationCheck.regulationRule,
          unit: regulationCheck.unit,
          alert: regulationCheck.alert
        }))
        .reduce((acc, curr) => {
          if (curr.type === ALERT_TYPES.enoughBreak) {
            const extra = curr.alert?.extra ? JSON.parse(curr.alert.extra) : {};
            const notEnoughBreak = extra.not_enough_break;
            const tooMuchUninterruptedWorkTime =
              extra.too_much_uninterrupted_work_time;
            if (notEnoughBreak) {
              acc.push({
                ...curr,
                type: ALERT_TYPES.minimumWorkDayBreak
              });
            }
            if (tooMuchUninterruptedWorkTime) {
              acc.push({
                ...curr,
                type: ALERT_TYPES.maximumUninterruptedWorkTime
              });
            }
            return acc;
          }
          acc.push(curr);
          return acc;
        }, []) ?? [],
    [regulationComputations, includeWeeklyAlerts]
  );

  if (stillRunning) {
    return (
      <Stack direction="column" rowGap={3} alignItems="center">
        <RunningTag />
        <RegulatoryTextNotCalculatedYet />
      </Stack>
    );
  }

  if (!loading && !regulationComputations) {
    return (
      <Stack direction="column" rowGap={3} alignItems="center">
        <WaitingTag />
        <RegulatoryTextNotCalculatedYet />
      </Stack>
    );
  }
  return (
    <>
      {loading && <Skeleton variant="rectangular" width="100%" height={300} />}
      {!loading &&
        regulationComputations &&
        (checksWithAlerts.length === 0 ? (
          <NoAlerts />
        ) : (
          <Stack direction="column" width="100%" rowGap={2} mt={2}>
            <Stack direction="row" columnGap={1}>
              <Typography variant="h4" fontSize="1.25rem">
                Infractions
              </Typography>
              <Badge noIcon severity="error">
                {checksWithAlerts.length}
              </Badge>
            </Stack>
            {checksWithAlerts.map((regulationCheck) =>
              renderRegulationCheck(regulationCheck)
            )}
          </Stack>
        ))}
    </>
  );
}

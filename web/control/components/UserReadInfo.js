import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { useControl } from "../../controller/utils/contextControl";
import { currentControllerId } from "common/utils/cookie";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import Stack from "@mui/material/Stack";
import { ControllerControlEmployeeInfo } from "../../controller/components/details/ControllerControlEmployeeInfo";
import { ControllerControlMissionInfo } from "../../controller/components/details/ControllerControlMissionInfo";
import { ControllerControlEmployments } from "../../controller/components/details/ControllerControlEmployments";
import { ControllerControlNote } from "../../controller/components/details/ControllerControlNote";
import { ControllerControlHistory } from "../../controller/components/details/ControllerControlHistory";
import { ControllerControlNbCards } from "../../controller/components/details/ControllerControlNbCard";
import { LoadingButton } from "common/components/LoadingButton";
import { formatPersonName } from "common/utils/coworkers";
import { makeStyles } from "@mui/styles";
import { useInfractions } from "../../controller/utils/contextInfractions";

const useStyles = makeStyles(theme => ({
  exportButton: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  }
}));

export function UserReadInfo({
  userInfo,
  employments,
  tokenInfo,
  controlTime,
  alertNumber,
  workingDaysNumber,
  setTab,
  allowC1BExport = true,
  companyName,
  vehicleRegistrationNumber,
  businesses
}) {
  const { controlData } = useControl() ?? {};
  const { checkedAlertsNumber } = useInfractions() ?? {};
  const [userName, setUserName] = React.useState("");
  React.useEffect(() => {
    if (userInfo) {
      setUserName(formatPersonName(userInfo));
    } else if (controlData) {
      setUserName(controlData.userFirstName + " " + controlData.userLastName);
    }
  }, [controlData, userInfo]);

  const alerts = useSnackbarAlerts();
  const api = useApi();
  const classes = useStyles();

  const onC1BExportClick = async () => {
    try {
      await api.downloadFileHttpQuery(HTTP_QUERIES.userC1bExport, {
        json: {
          min_date: tokenInfo.historyStartDay,
          max_date: tokenInfo.creationDay
        }
      });
    } catch (err) {
      alerts.error(formatApiError(err), "generate_tachograph_files", 6000);
    }
  };

  return (
    <Stack direction="column" p={3} rowGap={3}>
      <ControllerControlEmployeeInfo name={userName} />
      {!!currentControllerId() && (
        <ControllerControlMissionInfo
          vehicleRegistrationNumber={vehicleRegistrationNumber}
          companyName={companyName}
          businessTypeDuringControl={controlData.businessTypeDuringControl}
        />
      )}
      <ControllerControlEmployments
        employments={employments}
        businesses={businesses}
      />
      <ControllerControlHistory
        controlTime={controlTime}
        tokenInfo={tokenInfo}
      />
      <ControllerControlNbCards
        nbWorkingDays={workingDaysNumber}
        nbAlerts={alertNumber || checkedAlertsNumber || 0}
        setTab={setTab}
      />
      {controlData && <ControllerControlNote />}
      {allowC1BExport && (
        <div className={classes.exportButton}>
          <LoadingButton
            priority="secondary"
            className={classes.exportButton}
            onClick={onC1BExportClick}
          >
            Télécharger C1B
          </LoadingButton>
        </div>
      )}
    </Stack>
  );
}

import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { useControl } from "../../controller/utils/contextControl";
import { currentControllerId } from "common/utils/cookie";
import { formatApiError } from "common/utils/errors";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { ControllerControlEmployeeInfo } from "../../controller/components/details/ControllerControlEmployeeInfo";
import { ControllerControlMissionInfo } from "../../controller/components/details/ControllerControlMissionInfo";
import { ControllerControlEmployments } from "../../controller/components/details/ControllerControlEmployments";
import { ControllerControlNote } from "../../controller/components/details/ControllerControlNote";
import { ControllerControlHistory } from "../../controller/components/details/ControllerControlHistory";
import { ControllerControlNbCards } from "../../controller/components/details/ControllerControlNbCard";
import { LoadingButton } from "common/components/LoadingButton";
import { formatPersonName } from "common/utils/coworkers";
import { makeStyles } from "@mui/styles";
import { HTTP_QUERIES } from "common/utils/apiQueries/httpQueries";
import { fr } from "@codegouvfr/react-dsfr";
import { InfoItem } from "../../home/InfoField";
import { formatDateTime } from "common/utils/time";

const useStyles = makeStyles((theme) => ({
  exportButton: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  header: {
    backgroundColor: fr.colors.decisions.background.alt.grey.default,
    padding: theme.spacing(3),
    width: "100%",
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
    marginTop: theme.spacing(-3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  }
}));

export function UserReadInfo({
  userInfo,
  employments,
  tokenInfo,
  controlTime,
  workingDaysNumber,
  daysAddedPosterioriNumber,
  daysModifiedNumber,
  onChangeTab,
  allowC1BExport = true,
  companyName,
  vehicleRegistrationNumber,
  businesses
}) {
  const { controlData, updateControlTime } = useControl() ?? {};
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
    <Stack direction="column" maxWidth="100%" width="100%">
      <Box className={classes.header}>
        <ControllerControlEmployeeInfo name={userName} />
        <InfoItem
          name="Horaire de contrôle"
          value={formatDateTime(controlData?.controlTime || controlTime || tokenInfo.controlTime, true)}
          uppercaseTitle={false}
          titleProps={{
            component: "h2"
          }}
          direction="row"
          maxWidth="100%"
        />
        {vehicleRegistrationNumber && (
          <InfoItem
            name="Véhicule"
            value={vehicleRegistrationNumber}
            uppercaseTitle={false}
            titleProps={{
              component: "h2"
            }}
            direction="row"
            maxWidth="100%"
          />
        )}
        
      </Box>
      <Stack direction="column" p={3} rowGap={3}>
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
          controlTime={controlData?.controlTime || controlTime}
          tokenInfo={tokenInfo}
          updateControlTime={updateControlTime}
        />
        <ControllerControlNbCards
          nbWorkingDays={workingDaysNumber}
          daysAddedPosterioriNumber={daysAddedPosterioriNumber}
          daysModifiedNumber={daysModifiedNumber}
          onChangeTab={onChangeTab}
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
    </Stack>
  );
}

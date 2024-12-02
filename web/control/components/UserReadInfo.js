import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { InfoItem } from "../../home/InfoField";
import { formatPersonName } from "common/utils/coworkers";
import { EmploymentInfoCard } from "../../common/EmploymentInfoCard";
import {
  formatDateTime,
  frenchFormatDateStringOrTimeStamp
} from "common/utils/time";
import { LoadingButton } from "common/components/LoadingButton";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { Link } from "../../common/LinkButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DriveEtaIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";
import ListItemIcon from "@mui/material/ListItemIcon";
import { currentControllerId } from "common/utils/cookie";
import { ControllerControlNote } from "../../controller/components/details/ControllerControlNote";
import Notice from "../../common/Notice";
import { useControl } from "../../controller/utils/contextControl";
import { FieldTitle } from "../../common/typography/FieldTitle";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4)
  },
  linkButtons: {
    marginTop: theme.spacing(2)
  },
  exportButton: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  subSectionBody: {
    marginBottom: theme.spacing(2)
  },
  fieldValue: {
    fontWeight: 500,
    fontSize: "1rem",
    whiteSpace: "inherit"
  },
  bigFieldName: {
    fontSize: "2rem"
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

  return (
    <Stack direction="column" p={3} rowGap={4}>
      <div>
        <FieldTitle component="h6" className="bigFieldName">
          Salarié(e)
        </FieldTitle>
        <Typography variant="h4" component="p">
          {userName}
        </Typography>
      </div>
      {!!currentControllerId() && companyName && (
        <Stack direction="column">
          <Typography variant="h6" component="h2">
            Mission lors du contrôle
          </Typography>
          <Grid container spacing={2}>
            <List dense>
              <ListItem disableGutters>
                <ListItemIcon>
                  <DriveEtaIcon />
                </ListItemIcon>
                <Typography noWrap align="left" className={classes.fieldValue}>
                  {vehicleRegistrationNumber || "Non renseigné"}
                </Typography>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <Typography noWrap align="left" className={classes.fieldValue}>
                  {companyName}
                </Typography>
              </ListItem>
            </List>
          </Grid>
        </Stack>
      )}
      {!companyName && (
        <Notice
          type="warning"
          description="Aucune saisie en cours au moment du contrôle"
        />
      )}
      <div>
        <Typography
          variant="h6"
          component="h2"
          className={classes.subSectionBody}
        >
          Entreprise(s) de rattachement
        </Typography>
        <Grid container spacing={2} direction="column">
          {employments.map(e => (
            <Grid item key={e.id}>
              <EmploymentInfoCard
                key={e.id}
                employment={e}
                hideRole
                hideStatus
                hideActions
                lightenIfEnded={false}
                headingComponent="h3"
              />
            </Grid>
          ))}
        </Grid>
        {businesses && businesses.length > 1 && (
          <Notice
            type="warning"
            sx={{ marginTop: 2, marginBottom: 6 }}
            description={
              <>{`Attention, veuillez noter que ce salarié effectue des missions pour différents secteurs d’activité 
              (${businesses.join(", ")}).`}</>
            }
          />
        )}
      </div>
      <div>
        <Typography variant="h6" component="h2">
          Historique récent (28 jours)
        </Typography>
        <Typography>
          {frenchFormatDateStringOrTimeStamp(tokenInfo.historyStartDay)} -{" "}
          {frenchFormatDateStringOrTimeStamp(tokenInfo.creationDay)}
        </Typography>
        <InfoItem
          name="Heure de contrôle"
          value={formatDateTime(controlTime || tokenInfo.creationTime, true)}
          uppercaseTitle={false}
          titleProps={{
            component: "h3"
          }}
        />
      </div>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="column">
          <Typography>Journées enregistrées</Typography>
          <Typography>{workingDaysNumber}</Typography>
          <Link
            to="#"
            color="primary"
            variant="body1"
            onClick={e => {
              e.preventDefault();
              setTab("history");
            }}
          >
            Voir l'historique
          </Link>
        </Stack>
        <Stack direction="column">
          <Typography>Alertes réglementaires</Typography>
          <Typography>{alertNumber}</Typography>
          <Link
            to="#"
            color="primary"
            variant="body1"
            onClick={e => {
              e.preventDefault();
              setTab("alerts");
            }}
          >
            Voir alertes
          </Link>
        </Stack>
      </Stack>
      {controlData && <ControllerControlNote />}
      {allowC1BExport && (
        <div className={classes.exportButton}>
          <LoadingButton
            priority="secondary"
            className={classes.exportButton}
            onClick={async () => {
              try {
                await api.downloadFileHttpQuery(HTTP_QUERIES.userC1bExport, {
                  json: {
                    min_date: tokenInfo.historyStartDay,
                    max_date: tokenInfo.creationDay
                  }
                });
              } catch (err) {
                alerts.error(
                  formatApiError(err),
                  "generate_tachograph_files",
                  6000
                );
              }
            }}
          >
            Télécharger C1B
          </LoadingButton>
        </div>
      )}
    </Stack>
  );
}

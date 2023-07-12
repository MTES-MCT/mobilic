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
import Container from "@mui/material/Container";
import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import { Link } from "../../common/LinkButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DriveEtaIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";
import ListItemIcon from "@mui/material/ListItemIcon";
import Alert from "@mui/material/Alert";
import { currentControllerId } from "common/utils/cookie";
import { ControllerControlBottomMenu } from "../../controller/components/menu/ControllerControlBottomMenu";
import { useDownloadBDC } from "../../controller/utils/useDownloadBDC";
import { canDownloadBDC } from "../../controller/utils/controlBulletin";
import { ControllerControlNote } from "../../controller/components/details/ControllerControlNote";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4)
  },
  sectionBody: {
    marginBottom: theme.spacing(6)
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
  openBulletinControl,
  controlData
}) {
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

  const downloadBDC = useDownloadBDC(controlData.id);

  return (
    <Container maxWidth="md" className={classes.container}>
      <Grid container spacing={2} className={classes.sectionBody}>
        {controlData && (
          <Grid item xs={12} mb={2}>
            <ControllerControlNote controlData={controlData} />
          </Grid>
        )}
        <Grid item md={6}>
          <Typography variant="h5">Informations salarié(e)</Typography>
          <Grid
            container
            wrap="wrap"
            spacing={2}
            className={classes.subSectionBody}
          >
            <Grid item>
              <InfoItem name="Nom" value={userName} />
            </Grid>
          </Grid>
          {!companyName && !!currentControllerId() && (
            <Alert severity="warning">
              Aucune saisie en cours au moment du contrôle
            </Alert>
          )}
        </Grid>
        {companyName && (
          <Grid item md={6}>
            <Typography variant="h5">Mission lors du contrôle</Typography>
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
        )}
      </Grid>
      <Typography variant="h5" className={classes.subSectionBody}>
        Entreprise(s) de rattachement
      </Typography>
      <Grid
        container
        spacing={2}
        direction="column"
        className={classes.sectionBody}
      >
        {employments.map(e => (
          <Grid item key={e.id}>
            <EmploymentInfoCard
              key={e.id}
              employment={e}
              defaultOpen={employments.length === 1}
              hideRole
              hideStatus
              hideActions
              lightenIfEnded={false}
            />
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5">Historique récent (28 jours)</Typography>
      <Grid container wrap="wrap" spacing={2}>
        <Grid item>
          <InfoItem
            name="Heure du contrôle"
            value={formatDateTime(controlTime || tokenInfo.creationTime, true)}
          />
        </Grid>
        <Grid item>
          <InfoItem
            name="Début de l'historique"
            value={frenchFormatDateStringOrTimeStamp(tokenInfo.historyStartDay)}
          />
        </Grid>
        <Grid item>
          <InfoItem
            name="Fin de l'historique"
            value={frenchFormatDateStringOrTimeStamp(tokenInfo.creationDay)}
          />
        </Grid>
      </Grid>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={6}
        className={classes.linkButtons}
      >
        <Grid item xs={6} style={{ textAlign: "center" }}>
          <Typography>
            Nombre de journées enregistrées : {workingDaysNumber}
          </Typography>
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
        </Grid>
        <Grid item xs={6} style={{ textAlign: "center" }}>
          <Typography>
            Nombre d'alertes réglementaires : {alertNumber}
          </Typography>
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
        </Grid>
      </Grid>
      {allowC1BExport && (
        <Box className={classes.exportButton}>
          <LoadingButton
            color="primary"
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
            variant="outlined"
          >
            Télécharger C1B
          </LoadingButton>
        </Box>
      )}
      {!!currentControllerId() && (
        <>
          <ControllerControlBottomMenu
            editBDC={openBulletinControl}
            downloadBDC={downloadBDC}
            canDownloadBDC={canDownloadBDC(controlData)}
            BDCAlreadyExisting={!!controlData.controlBulletinCreationTime}
          />
        </>
      )}
    </Container>
  );
}

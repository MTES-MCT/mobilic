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
  companies: {
    marginBottom: theme.spacing(2)
  }
}));

export function UserReadInfo({
  userInfo,
  employments,
  tokenInfo,
  controlTime,
  alertNumber,
  setTab
}) {
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.container}>
      <Typography variant="h5">Informations salarié.e</Typography>
      <Grid container wrap="wrap" spacing={2} className={classes.sectionBody}>
        <Grid item>
          <InfoItem name="Identifiant Mobilic" bold value={userInfo.id} />
        </Grid>
        <Grid item>
          <InfoItem name="Nom" value={formatPersonName(userInfo)} />
        </Grid>
      </Grid>
      <Typography variant="h5" className={classes.companies}>
        Entreprises
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
      <Typography variant="h5">Historique récent (60 jours)</Typography>
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
          <Typography>Nombre de journées enregistrées : 28</Typography>
          <Link
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
    </Container>
  );
}

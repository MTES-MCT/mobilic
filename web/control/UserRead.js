import React from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { Header } from "../common/Header";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { useLoadingScreen } from "common/utils/loading";
import { formatPersonName } from "common/utils/coworkers";
import {
  DAY,
  formatDateTime,
  frenchFormatDateString,
  getStartOfMonth,
  now
} from "common/utils/time";
import {
  augmentAndSortMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { History } from "../pwa/screens/History";
import Grid from "@material-ui/core/Grid";
import { InfoItem } from "../home/InfoField";
import { USER_READ_QUERY } from "common/utils/apiQueries";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../common/Snackbar";
import * as Sentry from "@sentry/browser";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    margin: "auto",
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: "100%",
    textAlign: "left",
    backgroundColor: theme.palette.background.paper
  },
  sectionBody: {
    marginBottom: theme.spacing(6)
  }
}));

export function UserRead() {
  const location = useLocation();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  const [userInfo, setUserInfo] = React.useState(null);
  const [tokenInfo, setTokenInfo] = React.useState(null);
  const [controlTime, setControlTime] = React.useState(null);
  const [missions, setMissions] = React.useState(null);
  const [primaryEmployment, setPrimaryEmployment] = React.useState(null);
  const [coworkers, setCoworkers] = React.useState(null);
  const [vehicles, setVehicles] = React.useState(null);
  const [error, setError] = React.useState("");
  const classes = useStyles();

  React.useEffect(() => {
    async function onMount() {
      const queryString = new URLSearchParams(location.search);
      const token = queryString.get("token");
      const ts = queryString.get("ts");

      if (token) {
        withLoadingScreen(async () => {
          try {
            const userResponse = await api.graphQlMutate(
              USER_READ_QUERY,
              {
                token
              },
              { context: { nonPublicApi: true } }
            );
            const userPayload = userResponse.data.userFromReadToken.user;
            setTokenInfo({
              ...userResponse.data.userFromReadToken.tokenInfo,
              token
            });
            setUserInfo({
              id: userPayload.id,
              firstName: userPayload.firstName,
              lastName: userPayload.lastName,
              birthDate: userPayload.birthDate,
              email: userPayload.email
            });
            if (ts && ts !== "") setControlTime(ts);
            setMissions(
              augmentAndSortMissions(
                userPayload.missions.edges.map(m => ({
                  ...m.node,
                  ...parseMissionPayloadFromBackend(m.node, userPayload.id),
                  allActivities: m.node.activities
                })),
                userPayload.id
              ).filter(m => m.activities.length > 0)
            );
            const _vehicles = {};
            userPayload.currentEmployments.forEach(e => {
              e.company.vehicles.forEach(v => {
                _vehicles[v.id.toString()] = v;
              });
            });
            setVehicles(_vehicles);
            const _coworkers = {};
            userPayload.missions.edges.forEach(m => {
              m.node.activities.forEach(a => {
                _coworkers[a.user.id.toString()] = a.user;
              });
            });
            setCoworkers(_coworkers);
            setPrimaryEmployment(
              userPayload.currentEmployments.find(e => e.isPrimary)
            );
          } catch (err) {
            Sentry.captureException(err);
            setError(
              formatApiError(err, gqlError => {
                if (graphQLErrorMatchesCode(gqlError, "INVALID_TOKEN")) {
                  return "le lien d'accès à l'historique du salarié est invalide.";
                }
                if (graphQLErrorMatchesCode(gqlError, "EXPIRED_TOKEN")) {
                  return "le lien d'accès à l'historique du salarié a expiré.";
                }
              })
            );
          }
        });
      } else setError("lien d'accès à l'historique du salarié manquant");
    }
    onMount();
  }, [location]);

  return [
    <Header key={1} disableMenu />,
    <Container
      className={classes.container}
      key={2}
      disableGutters
      maxWidth="md"
    >
      {error ? (
        <Container>
          <Typography align="center" key={0} color="error">
            Impossible d'accéder à la page : {error}
          </Typography>
        </Container>
      ) : missions ? (
        [
          <Container maxWidth="md" key={0}>
            <Typography variant="h5">Informations salarié.e</Typography>
            <Grid
              container
              wrap="wrap"
              spacing={2}
              className={classes.sectionBody}
            >
              <Grid item>
                <InfoItem name="Identifiant Mobilic" bold value={userInfo.id} />
              </Grid>
              <Grid item>
                <InfoItem name="Nom" value={formatPersonName(userInfo)} />
              </Grid>
              <Grid item>
                <InfoItem
                  name="Entreprise"
                  value={
                    primaryEmployment ? primaryEmployment.company.name : ""
                  }
                />
              </Grid>
              <Grid item>
                <InfoItem
                  name="SIREN"
                  value={
                    primaryEmployment ? primaryEmployment.company.siren : ""
                  }
                />
              </Grid>
              <Grid item>
                <InfoItem
                  name="Invité le"
                  value={
                    primaryEmployment
                      ? frenchFormatDateString(primaryEmployment.startDate)
                      : ""
                  }
                />
              </Grid>
            </Grid>
            <Typography variant="h5">Historique récent (60 jours)</Typography>
            <Grid
              container
              wrap="wrap"
              spacing={2}
              className={classes.sectionBody}
            >
              <Grid item xs={12}>
                <InfoItem
                  name="Heure du contrôle"
                  value={formatDateTime(
                    controlTime || tokenInfo.creationTime,
                    true
                  )}
                />
              </Grid>
              <Grid item>
                <InfoItem
                  name="Début de l'historique"
                  value={frenchFormatDateString(tokenInfo.historyStartDay)}
                />
              </Grid>
              <Grid item>
                <InfoItem
                  name="Fin de l'historique"
                  value={frenchFormatDateString(tokenInfo.creationDay)}
                />
              </Grid>
              <Grid item xs={12}>
                <LoadingButton
                  color="primary"
                  onClick={async () => {
                    try {
                      await api.downloadFileHttpQuery(
                        "POST",
                        `/users/generate_tachograph_file`,
                        { json: { token: tokenInfo.token } }
                      );
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
              </Grid>
            </Grid>
          </Container>,
          <History
            key={1}
            missions={missions.filter(
              m => m.startTime >= getStartOfMonth(now() - 183 * DAY)
            )}
            displayActions={false}
            coworkers={coworkers}
            vehicles={vehicles}
            userId={userInfo.id}
          />
        ]
      ) : null}
    </Container>
  ];
}

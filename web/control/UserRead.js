import React from "react";
import keyBy from "lodash/keyBy";
import { useLocation, useParams } from "react-router-dom";
import { useApi, USER_READ_QUERY } from "common/utils/api";
import { Header } from "../common/Header";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { useLoadingScreen } from "common/utils/loading";
import { formatPersonName } from "common/utils/coworkers";
import { DAY, getStartOfMonth, now } from "common/utils/time";
import {
  augmentSortAndFilterMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { History } from "../pwa/screens/History";
import Grid from "@material-ui/core/Grid";
import { InfoItem } from "../home/InfoField";

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
  sectionTitle: {
    marginTop: theme.spacing(6)
  }
}));

export function UserRead() {
  const location = useLocation();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  const [userInfo, setUserInfo] = React.useState(null);
  const [missions, setMissions] = React.useState(null);
  const [primaryEmployment, setPrimaryEmployment] = React.useState(null);
  const [coworkers, setCoworkers] = React.useState(null);
  const [vehicles, setVehicles] = React.useState(null);
  const [error, setError] = React.useState("");
  const classes = useStyles();

  const { token } = useParams();

  React.useEffect(() => {
    async function onMount() {
      if (token) {
        withLoadingScreen(async () => {
          try {
            const userResponse = await api.graphQlMutate(
              USER_READ_QUERY,
              {
                token,
                activityAfter: now() - DAY * 215
              },
              { context: { nonPublicApi: true } }
            );
            const userPayload = userResponse.data.userFromReadToken;
            setUserInfo({
              id: userPayload.id,
              firstName: userPayload.firstName,
              lastName: userPayload.lastName,
              birthDate: userPayload.birthDate,
              email: userPayload.email
            });
            setMissions(
              augmentSortAndFilterMissions(
                userPayload.missions.map(m => ({
                  ...m,
                  ...parseMissionPayloadFromBackend(m, userPayload.id),
                  allActivities: m.activities
                })),
                userPayload.id
              )
            );
            if (userPayload.primaryCompany)
              setVehicles(
                keyBy(userPayload.primaryCompany.vehicles, v => v.id.toString())
              );
            const _coworkers = {};
            userPayload.missions.forEach(m => {
              m.activities.forEach(a => {
                _coworkers[a.user.id.toString()] = a.user;
              });
            });
            setCoworkers(_coworkers);
            setPrimaryEmployment(
              userPayload.currentEmployments.find(e => e.isPrimary)
            );
          } catch (err) {
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
      } else setError("lien d'accès manquant");
    }
    onMount();
  }, [location]);

  return [
    <Header key={1} disableMenu />,
    <Container
      className={classes.container}
      key={2}
      disableGutters
      maxWidth="sm"
    >
      {error ? (
        <Container>
          <Typography align="center" key={0} color="error">
            Impossible d'accéder à la page : {error}
          </Typography>
        </Container>
      ) : missions ? (
        [
          <Container maxWidth="sm" key={0}>
            <Typography variant="h5">Informations salarié.e</Typography>
            <Grid container wrap="wrap" spacing={2}>
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
                  value={primaryEmployment ? primaryEmployment.startDate : ""}
                />
              </Grid>
            </Grid>
            <Typography variant="h5" className={classes.sectionTitle}>
              Historique récent
            </Typography>
          </Container>,
          <History
            key={1}
            missions={missions.filter(
              m => m.startTime >= getStartOfMonth(now() - 183 * DAY)
            )}
            displayAccountButton={false}
            displayQRCodeGeneration={false}
            coworkers={coworkers}
            vehicles={vehicles}
            userId={userInfo.id}
          />
        ]
      ) : null}
    </Container>
  ];
}

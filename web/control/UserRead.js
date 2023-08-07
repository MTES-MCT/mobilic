import React from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useLoadingScreen } from "common/utils/loading";
import {
  augmentAndSortMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import {
  USER_READ_QUERY,
  USER_READ_TOKEN_QUERY
} from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../common/Snackbar";
import { captureSentryException } from "common/utils/sentry";
import { useImpersonation } from "./utils/impersonation";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { UserReadTabs } from "./components/UserReadTabs";
import { orderEmployments } from "common/utils/employments";
import { UserReadInfo } from "./components/UserReadInfo";
import { UserReadHistory } from "./components/UserReadHistory";
import { TextWithBadge } from "../common/TextWithBadge";
import { UserReadAlerts } from "./components/UserReadAlerts";
import { getDaysBetweenTwoDates } from "common/utils/time";
import { getRegulationComputationsAndAlertNumber } from "common/utils/regulation/useGetUserRegulationComputationsByDay";

export function getTabs(alertNumber) {
  return [
    {
      name: "info",
      label: "Informations",
      icon: <InfoOutlinedIcon />,
      component: UserReadInfo
    },
    {
      name: "alerts",
      label: (
        <TextWithBadge
          badgeContent={alertNumber || 0}
          color={alertNumber ? "error" : "success"}
        >
          Infractions
        </TextWithBadge>
      ),
      icon: <WarningAmberOutlinedIcon />,
      component: UserReadAlerts
    },
    {
      name: "history",
      label: "Historique",
      icon: <HistoryOutlinedIcon />,
      component: UserReadHistory
    }
  ];
}

export function UserRead() {
  const location = useLocation();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  const [userInfo, setUserInfo] = React.useState(null);
  const [tokenInfo, setTokenInfo] = React.useState(null);
  const [controlTime, setControlTime] = React.useState(null);
  const [missions, setMissions] = React.useState(null);
  const [employments, setEmployments] = React.useState([]);
  const [coworkers, setCoworkers] = React.useState(null);
  const [vehicles, setVehicles] = React.useState(null);
  const [periodOnFocus, setPeriodOnFocus] = React.useState(null);
  const [workingDays, setWorkingDays] = React.useState(new Set([]));
  const [
    regulationComputationsByDay,
    setRegulationComputationsByDay
  ] = React.useState([]);
  const [alertNumber, setAlertNumber] = React.useState(0);

  const [error, setError] = React.useState("");

  const impersonatingUser = useImpersonation(
    tokenInfo ? tokenInfo.token : null
  );

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const token = queryString.get("token");
    const ts = queryString.get("ts");

    if (token) {
      withLoadingScreen(async () => {
        try {
          const tokenResponse = await api.graphQlMutate(
            USER_READ_TOKEN_QUERY,
            {
              token
            },
            { context: { nonPublicApi: true } },
            true
          );
          setTokenInfo({
            ...tokenResponse.data.userReadToken,
            token
          });
        } catch (err) {
          captureSentryException(err);
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
    }
    if (ts && ts !== "") setControlTime(ts);
  }, [location]);

  React.useEffect(() => {
    if (impersonatingUser) {
      withLoadingScreen(async () => {
        await alerts.withApiErrorHandling(async () => {
          const userResponse = await api.graphQlMutate(
            USER_READ_QUERY,
            null,
            null,
            true
          );
          const userPayload = userResponse.data.me;
          setUserInfo({
            id: userPayload.id,
            firstName: userPayload.firstName,
            lastName: userPayload.lastName,
            birthDate: userPayload.birthDate,
            email: userPayload.email
          });
          const missions_ = augmentAndSortMissions(
            userPayload.missions.edges.map(m => ({
              ...m.node,
              ...parseMissionPayloadFromBackend(m.node, userPayload.id),
              allActivities: m.node.activities
            })),
            userPayload.id
          ).filter(m => m.activities.length > 0);

          setMissions(missions_);

          const userWorkingDays = new Set([]);
          missions_.forEach(mission =>
            getDaysBetweenTwoDates(
              mission.startTime,
              mission.endTime || tokenInfo.creationDay
            ).forEach(day => userWorkingDays.add(day))
          );
          setWorkingDays(userWorkingDays);
          const _vehicles = {};
          userPayload.employments.forEach(e => {
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
          setEmployments(orderEmployments(userPayload.employments));
        });
      });
    }
  }, [impersonatingUser]);

  React.useEffect(async () => {
    if (!userInfo || !userInfo.id) {
      return;
    }
    const res = await getRegulationComputationsAndAlertNumber(
      api,
      userInfo.id,
      new Date(tokenInfo.historyStartDay)
    );
    setRegulationComputationsByDay(res.regulationComputationsByDay);
    setAlertNumber(res.alertNumber);
  }, [userInfo]);

  const TABS = getTabs(alertNumber);

  return [
    <Header key={1} disableMenu />,
    error ? (
      <Container>
        <Typography align="center" key={0} color="error">
          Impossible d'accéder à la page : {error}
        </Typography>
      </Container>
    ) : missions ? (
      <UserReadTabs
        key={1}
        tabs={TABS}
        alertNumber={alertNumber}
        userInfo={userInfo}
        tokenInfo={tokenInfo}
        controlTime={controlTime}
        missions={missions}
        employments={employments}
        coworkers={coworkers}
        vehicles={vehicles}
        periodOnFocus={periodOnFocus}
        setPeriodOnFocus={setPeriodOnFocus}
        workingDaysNumber={workingDays.size}
        regulationComputationsByDay={regulationComputationsByDay}
      />
    ) : null
  ];
}

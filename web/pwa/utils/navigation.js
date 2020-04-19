import { ACTIVITIES } from "common/utils/activities";
import { BeforeWork } from "../screens/BeforeWork";
import { CurrentActivity } from "../screens/CurrentActivity";
import React from "react";
import TimerIcon from "@material-ui/icons/Timer";
import TimelineIcon from "@material-ui/icons/Timeline";
import InfoIcon from "@material-ui/icons/Info";
import { PlaceHolder } from "../../common/PlaceHolder";
import BottomNavBar from "../components/BottomNavBar";
import { History } from "../screens/History";
import Typography from "@material-ui/core/Typography";
import { DailyContext } from "../screens/DailyContext";
import Container from "@material-ui/core/Container";

const SCREENS_WITH_BOTTOM_NAVIGATION = {
  activity: {
    name: "activity",
    label: "Activité",
    renderIcon: props => <TimerIcon {...props} />,
    render: props =>
      props.currentActivity &&
      props.currentActivity.type !== ACTIVITIES.rest.name ? (
        <CurrentActivity {...props} />
      ) : (
        <BeforeWork {...props} />
      )
  },
  context: {
    name: "context",
    label: "Infos",
    renderIcon: props => <InfoIcon {...props} />,
    render: props => <DailyContext {...props} />
  },
  history: {
    name: "history",
    label: "Historique",
    renderIcon: props => <TimelineIcon {...props} />,
    render: props =>
      props.previousDaysActivityEventsByDay.length > 0 ? (
        <History {...props} />
      ) : (
        <PlaceHolder>
          <Typography variant="h3">😅</Typography>
          <Typography variant="h3">
            Vous n'avez pas encore d'historique !
          </Typography>
        </PlaceHolder>
      )
  }
};

export function ScreenWithBottomNavigation(props) {
  const [screen, setScreen] = React.useState(
    SCREENS_WITH_BOTTOM_NAVIGATION.activity.name
  );
  return [
    <Container key={0} className="app-container" maxWidth={false}>
      {SCREENS_WITH_BOTTOM_NAVIGATION[screen].render({ key: 1, ...props })}
    </Container>,
    <BottomNavBar
      key={1}
      screens={SCREENS_WITH_BOTTOM_NAVIGATION}
      currentScreen={screen}
      setCurrentScreen={setScreen}
    />
  ];
}

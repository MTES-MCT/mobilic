import { ACTIVITIES } from "./activities";
import { BeforeWork } from "../../app/screens/BeforeWork";
import { CurrentActivity } from "../../app/screens/CurrentActivity";
import React from "react";
import TimerIcon from "@material-ui/icons/Timer";
import TimelineIcon from "@material-ui/icons/Timeline";
import { PlaceHolder } from "../components/PlaceHolder";
import BottomNavBar from "../../app/components/BottomNavBar";
import { History } from "../../app/screens/History";
import Typography from "@material-ui/core/Typography";

const SCREENS_WITH_BOTTOM_NAVIGATION = {
  activity: {
    name: "activity",
    label: "Activité",
    renderIcon: props => <TimerIcon {...props} />,
    render: props =>
      props.currentActivityType === ACTIVITIES.end.name ? (
        <BeforeWork {...props} />
      ) : (
        <CurrentActivity {...props} />
      )
  },
  history: {
    name: "history",
    label: "Historique",
    renderIcon: props => <TimelineIcon {...props} />,
    render: props =>
      props.previousDaysEventsByDay.length > 0 ? (
        <History {...props} />
      ) : (
        <PlaceHolder>
          <Typography variant="h4">😅</Typography>
          <Typography style={{ fontWeight: "bold" }}>
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
    SCREENS_WITH_BOTTOM_NAVIGATION[screen].render({ key: 1, ...props }),
    <BottomNavBar
      key={2}
      screens={SCREENS_WITH_BOTTOM_NAVIGATION}
      currentScreen={screen}
      setCurrentScreen={setScreen}
    />
  ];
}

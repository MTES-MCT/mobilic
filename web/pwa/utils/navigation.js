import { BeforeWork } from "../screens/BeforeWork";
import { CurrentActivity } from "../screens/CurrentActivity";
import React from "react";
import { MissionReview } from "../screens/MissionReview";
import App from "common/components/App";
import { useStoreMissions } from "common/store/contextMissions";

function InnerAppScreen(props) {
  const { displayCurrentMission } = useStoreMissions();

  if (!displayCurrentMission) {
    return <BeforeWork {...props} />;
  }
  if (!props.currentMission.ended || !props.latestActivity.endTime) {
    return <CurrentActivity {...props} />;
  } else return <MissionReview {...props} />;
}

export default function ActualApp() {
  return <App ScreenComponent={InnerAppScreen} />;
}

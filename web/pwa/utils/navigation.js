import { BeforeWork } from "../screens/BeforeWork";
import { CurrentActivity } from "../screens/CurrentActivity";
import React from "react";
import { MissionReview } from "../screens/MissionReview";
import App from "common/components/App";

function _InnerAppScreen(props) {
  if (
    !props.latestActivity ||
    !props.currentMission ||
    (props.currentMission && props.currentMission.adminValidation) ||
    (props.currentMission.validation &&
      props.currentMission.ended &&
      props.latestActivity.endTime)
  ) {
    return <BeforeWork {...props} />;
  }
  if (!props.currentMission.ended || !props.latestActivity.endTime) {
    return <CurrentActivity {...props} />;
  } else return <MissionReview {...props} />;
}

export default function ActualApp() {
  return <App ScreenComponent={_InnerAppScreen} />;
}

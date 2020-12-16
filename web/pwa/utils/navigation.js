import { BeforeWork } from "../screens/BeforeWork";
import { CurrentActivity } from "../screens/CurrentActivity";
import React from "react";
import Container from "@material-ui/core/Container";
import { MissionReview } from "../screens/MissionReview";

export function _InnerAppScreen(props) {
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

export function AppScreen(props) {
  return [
    <Container key={0} className="app-container full-height" maxWidth="sm">
      <_InnerAppScreen {...props} />
    </Container>
  ];
}

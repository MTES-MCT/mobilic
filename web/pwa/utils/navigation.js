import { ACTIVITIES } from "common/utils/activities";
import { BeforeWork } from "../screens/BeforeWork";
import { CurrentActivity } from "../screens/CurrentActivity";
import React from "react";
import Container from "@material-ui/core/Container";
import { MissionReview } from "../screens/MissionReview";

export function _InnerAppScreen(props) {
  if (
    props.currentActivity &&
    props.currentMission &&
    !props.currentMission.validated
  ) {
    if (props.currentActivity.type !== ACTIVITIES.rest.name) {
      return <CurrentActivity {...props} />;
    } else return <MissionReview {...props} />;
  }
  return <BeforeWork {...props} />;
}

export function AppScreen(props) {
  return [
    <Container key={0} className="app-container full-height" maxWidth={false}>
      <_InnerAppScreen {...props} />
    </Container>
  ];
}

import map from "lodash/map";
import pickBy from "lodash/pickBy";
import { Link } from "../../common/LinkButton";
import React from "react";
import { JoinedText } from "./JoinedText";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL } from "common/utils/matomoTags";

export function MissionNamesList({ missionNames, openMission }) {
  const filteredMissionNames = pickBy(missionNames, (name, id) => !!name);
  const { trackEvent } = useMatomo();

  return (
    <JoinedText joinWith=", ">
      {map(filteredMissionNames, (name, id) => (
        <Link
          key={id}
          to="#"
          onClick={e => {
            e.stopPropagation();
            trackEvent(OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL);
            openMission(id);
          }}
        >
          {name}
        </Link>
      ))}
    </JoinedText>
  );
}

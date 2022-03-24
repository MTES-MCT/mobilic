import map from "lodash/map";
import pickBy from "lodash/pickBy";
import { Link } from "../../common/LinkButton";
import React from "react";
import { JoinedText } from "./JoinedText";
import { useMatomo } from "@datapunt/matomo-tracker-react";

export function MissionNamesList({ missionNames, openMission }) {
  const filteredMissionNames = pickBy(missionNames, (name, id) => !!name);
  const { trackEvent } = useMatomo();

  return (
    <JoinedText joinWith=", ">
      {map(filteredMissionNames, (name, id) => (
        <Link
          key={id}
          onClick={e => {
            e.stopPropagation();
            trackEvent({
              category: "admin-navigation",
              action: "open-mission-drawer",
              name: "Drawer Mission dans tableau Activités"
            });
            openMission(id);
          }}
        >
          {name}
        </Link>
      ))}
    </JoinedText>
  );
}

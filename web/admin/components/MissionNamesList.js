import map from "lodash/map";
import pickBy from "lodash/pickBy";
import { Link } from "../../common/LinkButton";
import React from "react";
import { JoinedText } from "./JoinedText";

export function MissionNamesList({ missionNames, openMission }) {
  const filteredMissionNames = pickBy(missionNames, (name, id) => !!name);

  return (
    <JoinedText joinWith=", ">
      {map(filteredMissionNames, (name, id) => (
        <Link
          onClick={e => {
            e.stopPropagation();
            openMission(id);
          }}
        >
          {name}
        </Link>
      ))}
    </JoinedText>
  );
}

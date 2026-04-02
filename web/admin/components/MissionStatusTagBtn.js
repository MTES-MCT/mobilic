import React from "react";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { Link } from "../../common/LinkButton";
const { OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL } = require("common/utils/matomoTags");

export const MissionStatusTagBtn = ({ children, openMission, missionId }) => {
    const { trackEvent } = useMatomo();

    if (openMission && !missionId) {
        console.error("MissionStatusTagBtn: openMission function provided without missionId");
        return <span>{children}</span>;
    }

    return (
        <Link
            to="#"
            onClick={e => {
                console.log("MissionStatusTagBtn clicked, missionId:", missionId);
                console.log('openMission function:', openMission);
                e.stopPropagation();
                openMission && trackEvent(OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL);
                openMission && openMission(missionId);
            }}
        >
            {children}
        </Link>
    );
}
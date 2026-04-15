import React from "react";
import PropTypes from "prop-types";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { Link } from "../../common/LinkButton";
import { OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL } from "common/utils/matomoTags";

export const MissionStatusTagBtn = ({ children, openMission, missionId }) => {
    const { trackEvent } = useMatomo();

    if (openMission && !missionId) {
        return <span>{children}</span>;
    }

    return (
        <Link
            to="#"
            onClick={e => {
                e.stopPropagation();

                if (openMission) {
                    trackEvent(OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL);
                    openMission(missionId);
                }
            }}
        >
            {children}
        </Link>
    );
};

MissionStatusTagBtn.propTypes = {
    children: PropTypes.node,
    openMission: PropTypes.func,
    missionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

import React from "react";
import Box from "@mui/material/Box";
import { fr } from "@codegouvfr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { formatPersonName } from "common/utils/coworkers";
import {
  MISSION_RESOURCE_TYPES,
  allEventsForResource
} from "common/utils/contradictory";
import { getChangeIconAndText } from "../../../common/logEvent";

const useStyles = makeStyles(() => ({
  banner: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: "12px 16px 16px",
    gap: 8,
    backgroundColor: fr.colors.decisions.background.contrast.warning.default,
    marginBottom: 16
  },
  icon: {
    color: fr.colors.decisions.background.flat.warning.default,
    flexShrink: 0,
    marginTop: 4
  },
  content: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 4,
    flexGrow: 1
  },
  title: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.background.flat.warning.default,
    marginBottom: 8
  },
  list: {
    margin: 0,
    paddingLeft: 20,
    "& li": {
      fontSize: 14,
      lineHeight: "24px",
      color: fr.colors.decisions.background.flat.warning.default
    }
  }
}));

function getLastManagerEvent(activity) {
  const safeCopy = {
    ...activity,
    versions: activity.versions ? [...activity.versions] : undefined
  };
  const events = allEventsForResource(safeCopy, MISSION_RESOURCE_TYPES.activity);
  if (events.length === 0) return null;
  const userId = activity.user?.id || activity.userId;
  const managerEvents = events.filter(e => e.submitterId !== userId);
  return managerEvents.length > 0 ? managerEvents[managerEvents.length - 1] : events[events.length - 1];
}

export function DisputeBanner({ mission }) {
  const classes = useStyles();
  const { activities, userNameById } = React.useMemo(() => {
    const base = mission.activities || [];
    const history = mission.resourcesWithHistory?.resources
      ?.filter(r => r.type === MISSION_RESOURCE_TYPES.activity)
      ?.map(r => r.resource) || [];
    const historyIds = new Set(history.map(a => a.id));
    const merged = [
      ...history,
      ...base.filter(a => !historyIds.has(a.id))
    ];
    const names = {};
    base.forEach(a => {
      if (a.user) names[a.userId || a.user.id] = formatPersonName(a.user);
    });
    return { activities: merged, userNameById: names };
  }, [mission.activities, mission.resourcesWithHistory]);

  const byEmployee = React.useMemo(() => {
    const groups = {};
    activities
      .filter((a) => a.dispute?.status === "created")
      .forEach((a) => {
        const empId = a.dispute.submitter_id;
        if (!groups[empId]) {
          groups[empId] = {
            employeeName: formatPersonName(a.user) || userNameById[a.userId] || "",
            disputes: []
          };
        }
        const event = getLastManagerEvent(a);
        let description = "";
        if (event) {
          const texts = getChangeIconAndText(event);
          const authorName = event.submitter ? formatPersonName(event.submitter) : "";
          description = texts.map(t => `${authorName} ${t.text}`).join(" et ");
        }
        groups[empId].disputes.push({
          id: a.id,
          text: a.dispute.text,
          description
        });
      });
    return Object.entries(groups).map(([empId, group]) => ({
      empId,
      ...group
    }));
  }, [activities, userNameById]);

  if (byEmployee.length === 0) return null;

  return (
    <>
      {byEmployee.map(({ empId, employeeName, disputes }) => (
        <Box key={empId} className={classes.banner}>
          <span
            className={`fr-icon-warning-fill ${classes.icon}`}
            aria-hidden="true"
          />
          <Box className={classes.content}>
            <span className={classes.title}>
              {employeeName} a contesté les modifications suivantes :
            </span>
            <ul className={classes.list}>
              {disputes.map((d) => (
                <li key={d.id}>
                  {d.description}
                  {d.text && ` (motif de la contestation : ${"\u201C"}${d.text}${"\u201D"})`}
                </li>
              ))}
            </ul>
          </Box>
        </Box>
      ))}
    </>
  );
}

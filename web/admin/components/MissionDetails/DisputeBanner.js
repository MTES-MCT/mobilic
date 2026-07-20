import React from "react";
import Box from "@mui/material/Box";
import { fr } from "@codegouvfr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { formatPersonName } from "common/utils/coworkers";
import { ACTIVITIES } from "common/utils/activities";

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
    color: fr.colors.decisions.background.flat.warning.default
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

export function DisputeBanner({ mission }) {
  const classes = useStyles();
  const activities = mission.allActivities || mission.activities || [];

  const byEmployee = React.useMemo(() => {
    const groups = {};
    activities
      .filter((a) => a.dispute?.status === "created")
      .forEach((a) => {
        const empId = a.dispute.submitter_id;
        if (!groups[empId]) {
          groups[empId] = {
            employeeName: formatPersonName(a.user),
            disputes: []
          };
        }
        groups[empId].disputes.push(a);
      });
    return Object.entries(groups).map(([empId, group]) => ({
      empId,
      ...group
    }));
  }, [activities]);

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
              {disputes.map((a) => (
                <li key={a.id}>
                  Activité {ACTIVITIES[a.type]?.label} (motif :{" "}
                  {"\u201C"}
                  {a.dispute.text}
                  {"\u201D"})
                </li>
              ))}
            </ul>
          </Box>
        </Box>
      ))}
    </>
  );
}

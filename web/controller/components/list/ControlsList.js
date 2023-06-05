import React, { useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { makeStyles } from "@mui/styles";

import {
  formatTimeOfDay,
  startOfDayAsDate,
  startOfMonthAsDate,
  startOfWeekAsDate,
  getPrettyDateByperiod,
  formatDay
} from "common/utils/time";
import groupBy from "lodash/groupBy";
import ControlsTable from "../list/table/ControlsTable";
import CircularProgress from "@mui/material/CircularProgress";

const useStyles = makeStyles(theme => ({
  icon: {
    fontSize: "0.9rem",
    color: "#3284FE"
  },
  summary: {
    color: "#3284FE",
    borderBottom: "1px solid #3284FE",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)"
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1)
    }
  },
  details: {
    padding: 0
  }
}));

const getGroupByKey = (date, period) => {
  switch (period) {
    case "day":
      return startOfDayAsDate(date);
    case "week":
      return startOfWeekAsDate(date);
    case "month":
      return startOfDayAsDate(startOfMonthAsDate(date));
    default:
      return;
  }
};

export function ControlsList({
  controls,
  loading,
  clickOnRow,
  period = "day"
}) {
  const controlsByPeriod = useMemo(() => {
    const controlsGroupedByPeriod = groupBy(controls, control =>
      getGroupByKey(new Date(control.creationTime * 1000), period)
    );
    let res = [];
    for (const date in controlsGroupedByPeriod) {
      res.push({
        date,
        prettyDate: getPrettyDateByperiod(new Date(date), period),
        entries: controlsGroupedByPeriod[date]
          .map(control => ({
            id: control.id,
            employee: `${control.userFirstName} ${control.userLastName}`,
            vehicle: control.vehicleRegistrationNumber,
            company: control.companyName,
            time: control.creationTime,
            controlLocation: "Bientôt disponible",
            formattedTime:
              (period !== "day"
                ? `${formatDay(control.creationTime)} - `
                : "") + formatTimeOfDay(control.creationTime),
            type: control.controlType,
            nbControlledDays: control.nbControlledDays
          }))
          .sort((control1, control2) => control2.time - control1.time)
      });
    }
    res.sort((group1, group2) => new Date(group2.date) - new Date(group1.date));
    return res;
  }, [controls, period]);
  const classes = useStyles();

  return loading ? (
    <CircularProgress
      style={{
        zIndex: 9999
      }}
      color="primary"
    />
  ) : (
    controlsByPeriod.map(histo => (
      <Accordion key={`entries_${histo.date}`} disableGutters elevation={0}>
        <AccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
          expandIcon={<ArrowForwardIosSharpIcon className={classes.icon} />}
          className={classes.summary}
        >
          <Typography>{histo.prettyDate}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <ControlsTable
            entries={histo.entries}
            onRowClick={clickOnRow}
            period={period}
          />
        </AccordionDetails>
      </Accordion>
    ))
  );
}

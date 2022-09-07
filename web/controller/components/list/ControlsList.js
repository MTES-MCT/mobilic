import React, { useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { makeStyles } from "@mui/styles";

import {
  prettyFormatDay,
  formatTimeOfDay,
  startOfDayAsDate,
  startOfMonthAsDate,
  textualPrettyFormatWeek,
  startOfWeekAsDate,
  prettyFormatMonth
} from "common/utils/time";
import groupBy from "lodash/groupBy";
import ControlsTable from "../list/table/ControlsTable";

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
      return startOfMonthAsDate(date);
    default:
      return;
  }
};

const getPrettyDate = (date, period) => {
  switch (period) {
    case "day":
      return prettyFormatDay(date, true);
    case "week":
      return textualPrettyFormatWeek(date);
    case "month":
      return prettyFormatMonth(date);
    default:
      return;
  }
};

export function ControlsList({ controls, clickOnRow, period = "day" }) {
  const controlsByPeriod = useMemo(() => {
    const controlsGroupedByPeriod = groupBy(controls, control =>
      getGroupByKey(new Date(control.qrCodeGenerationTime * 1000), period)
    );
    let res = [];
    for (const date in controlsGroupedByPeriod) {
      res.push({
        date,
        prettyDate: getPrettyDate(
          controlsGroupedByPeriod[date][0].qrCodeGenerationTime,
          period
        ),
        entries: controlsGroupedByPeriod[date].map(control => ({
          id: control.id,
          employee: `${control.user.firstName} ${control.user.lastName}`,
          vehicle: control.vehicleRegistrationNumber,
          company: control.companyName,
          time: formatTimeOfDay(control.qrCodeGenerationTime),
          type: control.controlType,
          nbDays: ""
        }))
      });
    }
    res.sort(
      (control1, control2) => new Date(control2.date) - new Date(control1.date)
    );
    return res;
  }, [controls, period]);
  const classes = useStyles();

  return controlsByPeriod.map(histo => (
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
        <ControlsTable entries={histo.entries} onRowClick={clickOnRow} />
      </AccordionDetails>
    </Accordion>
  ));
}

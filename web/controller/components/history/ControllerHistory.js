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
  startOfDayAsDate
} from "common/utils/time";
import groupBy from "lodash/groupBy";
import ControlsTable from "../table/ControlsTable";

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

export function ControllerHistory({ controls, setControlIdOnFocus }) {
  const controlsByDate = useMemo(() => {
    const controlsGroupedByDate = groupBy(controls, control =>
      startOfDayAsDate(new Date(control.qrCodeGenerationTime * 1000))
    );
    let res = [];
    for (const date in controlsGroupedByDate) {
      res.push({
        date,
        prettyDate: prettyFormatDay(
          controlsGroupedByDate[date][0].qrCodeGenerationTime,
          true
        ),
        entries: controlsGroupedByDate[date].map((control, idx) => ({
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
  }, [controls]);
  const classes = useStyles();

  return controlsByDate.map(histo => (
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
          onRowClick={setControlIdOnFocus}
        />
      </AccordionDetails>
    </Accordion>
  ));
}

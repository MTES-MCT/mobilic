import React, { useMemo } from "react";
import { Table } from "@dataesr/react-dsfr";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { makeStyles } from "@mui/styles";
import { useIsWidthUp } from "common/utils/useWidth";

import { prettyFormatDay, formatTimeOfDay } from "common/utils/time";
import groupBy from "lodash/groupBy";

const columns = [
  { name: "company", label: "Nom entreprise" },
  { name: "employee", label: "Salarié" },
  { name: "vehicle", label: "Véhicule" },
  { name: "time", label: "Heure" },
  { name: "type", label: "Type" },
  { name: "nbDays", label: "Jours contrôlés" }
];

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

export function ControllerHistory({ controls }) {
  const isMdUp = useIsWidthUp("md");
  const controlsByDate = useMemo(() => {
    const controlsGroupedByDate = groupBy(controls, control =>
      prettyFormatDay(control.qrCodeGenerationTime, true)
    );
    let res = [];
    for (const date in controlsGroupedByDate) {
      res.push({
        date,
        entries: controlsGroupedByDate[date].map((control, idx) => ({
          id: idx,
          employee: `${control.user.firstName} ${control.user.lastName}`,
          vehicle: "1234ABC01",
          company: "nom XYZ",
          time: formatTimeOfDay(control.qrCodeGenerationTime),
          type: control.controlType
        }))
      });
    }
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
        <Typography>{histo.date}</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Table
          className={`fr-table--bordered ${isMdUp && "fr-table--layout-fixed"}`}
          rowKey={x => x.id}
          data={histo.entries}
          columns={columns}
        ></Table>
      </AccordionDetails>
    </Accordion>
  ));
}

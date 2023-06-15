import React from "react";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  alertCriteria: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& .MuiAlert-message": {
      width: "100%"
    }
  },
  accordionCriteria: {
    width: "100%",
    "&::before": {
      content: "none"
    },
    "&.Mui-disabled": {
      background: "inherit"
    },
    background: "inherit"
  },
  accordionSummary: {
    padding: 0,
    fontWeight: "bold",
    minHeight: "unset",
    margin: 0,
    "& .MuiAccordionSummary-content": {
      margin: 0
    },
    "&.Mui-expanded": {
      minHeight: "unset",
      margin: 0,
      backgroundColor: "inherit"
    }
  },
  accordionDetails: {
    display: "block",
    background: "inherit",
    padding: 0,
    marginTop: theme.spacing(2)
  }
}));

export default function CertificationCriteriaSingleResult({
  criteria,
  status
}) {
  const classes = useStyles();
  return (
    <Alert
      key={criteria.title}
      severity={status}
      className={classes.alertCriteria}
    >
      <Accordion elevation={0} className={classes.accordionCriteria}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.accordionSummary}
        >
          {criteria.title}
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          {criteria.explanation}
        </AccordionDetails>
      </Accordion>
    </Alert>
  );
}

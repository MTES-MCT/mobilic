import React from "react";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  alertCriteria: {
    "& .MuiAlert-message": {
      width: "100%"
    }
  },
  accordionCriteria: {
    width: "100%",
    overflow: "hidden",
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
  status,
  ...props
}) {
  const classes = useStyles();
  return (
    <Alert
      key={criteria.title}
      severity={status}
      sx={{ marginY: 1 }}
      className={classes.alertCriteria}
      iconMapping={{ info: false }}
      {...props}
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

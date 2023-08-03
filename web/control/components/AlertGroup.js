import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { RegulatoryAlert } from "./RegulatoryAlert";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

const useStyles = makeStyles(theme => {
  return {
    container: {
      width: "100%"
    },
    details: {
      display: "block"
    },
    collapseToggle: {
      padding: 0,
      margin: 0,
      marginRight: theme.spacing(1)
    },
    alertNumber: {
      display: "inline-flex",
      fontSisze: "120%",
      borderRadius: theme.spacing(1.5),
      backgroundColor: theme.palette.error.main,
      color: "white",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      height: theme.spacing(3),
      minWidth: theme.spacing(3),
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold"
    },
    description: {
      fontStyle: "italic",
      color: theme.palette.grey[600]
    }
  };
});

const getLabel = (label, sanction) =>
  sanction === "NATINF 32083" ? label.replace("quotidien", "de nuit") : label;

const getDescription = (description, sanction) =>
  sanction === "NATINF 32083"
    ? `${description}. Si une partie du travail de la journée s'effectue entre minuit et 5 heures, la durée maximale du travail est réduite à 10 heures`
    : description;

export function AlertGroup({
  alerts,
  infringementLabel,
  description,
  type,
  sanction,
  setPeriodOnFocus,
  setTab
}) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  return (
    <Accordion
      expanded={open}
      onChange={(event, open_) => setOpen(open_)}
      variant="outlined"
      className={classes.container}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography className="bold" color="primary">
              {sanction}
            </Typography>
            <Typography className="bold">
              {getLabel(infringementLabel, sanction)}
            </Typography>
          </Grid>
          <Grid item>
            <span className={classes.alertNumber}>{alerts.length}</span>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Typography className={classes.description}>
          {getDescription(description, sanction)}
        </Typography>
        <List>
          {alerts.map((a, index) => (
            <ListItem key={index} disableGutters>
              <RegulatoryAlert
                alert={a}
                type={type}
                setPeriodOnFocus={setPeriodOnFocus}
                setTab={setTab}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

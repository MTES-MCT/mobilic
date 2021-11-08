import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { RegulatoryAlert } from "./RegulatoryAlert";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";

const useStyles = makeStyles(theme => {
  return {
    container: {
      width: "100%",
      border: "none"
    },
    summary: {
      paddingLeft: 0,
      paddingRight: 0
    },
    details: {
      padding: 0,
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

export function AlertGroup({
  alerts,
  infringementLabel,
  description,
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
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        className={classes.summary}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justify="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography className="bold">{infringementLabel}</Typography>
          </Grid>
          <Grid item>
            <span className={classes.alertNumber}>{alerts.length}</span>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Typography className={classes.description}>{description}</Typography>
        <List>
          {alerts.map((a, index) => (
            <ListItem key={index} disableGutters>
              <RegulatoryAlert
                alert={a}
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

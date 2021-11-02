import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Collapse/Collapse";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { RegulatoryAlert } from "./RegulatoryAlert";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles(theme => {
  return {
    container: {
      width: "100%"
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
      color: theme.palette.grey[600],
      paddingTop: theme.spacing(1)
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

  function toggleOpen() {
    setOpen(!open);
  }

  return (
    <Grid
      container
      spacing={2}
      alignItems="flex-start"
      justify="flex-start"
      wrap="nowrap"
    >
      <Grid item>
        <IconButton
          aria-label={open ? "Masquer" : "Afficher"}
          color="inherit"
          className={classes.collapseToggle}
          onClick={toggleOpen}
        >
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Grid>
      <Grid item style={{ flexGrow: 1 }}>
        <Grid
          container
          spacing={2}
          wrap="nowrap"
          justify="space-between"
          alignItems="flex-start"
        >
          <Grid
            item
            onClick={() => setOpen(!open)}
            toggleOpen
            style={{ cursor: "pointer" }}
          >
            <Typography className="bold">{infringementLabel}</Typography>
          </Grid>
          <Grid item>
            <span className={classes.alertNumber}>{alerts.length}</span>
          </Grid>
        </Grid>
        <Collapse in={open}>
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
        </Collapse>
      </Grid>
    </Grid>
  );
}

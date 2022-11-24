import React from "react";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import { Link } from "../../common/LinkButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { AlertGroup } from "./AlertGroup";
import { getLatestAlertComputationVersion } from "common/utils/regulation/alertVersions";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4)
  },
  linkContainer: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  italicInfo: {
    fontStyle: "italic",
    color: theme.palette.grey[600]
  },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  }
}));

export function UserReadAlerts({
  setTab,
  groupedAlerts = [],
  setPeriodOnFocus,
  regulationComputations
}) {
  const classes = useStyles();

  const newVersionGroupedAlerts = regulationComputations.reduce((arr, item) => {
    const breachedRegulationChecks = getLatestAlertComputationVersion(
      item.regulationComputations
    ).regulationChecks.filter(regulationCheck => !!regulationCheck.alert);
    for (const breachedRegCheck of breachedRegulationChecks) {
      let checkInArray = arr.find(
        item => item.infringementLabel === breachedRegCheck.label
      );
      if (checkInArray) {
        checkInArray.alerts.push(breachedRegCheck.alert);
      } else {
        arr.push({
          infringementLabel: breachedRegCheck.label,
          description: breachedRegCheck.description,
          alerts: [breachedRegCheck.alert]
        });
      }
    }
    return arr;
  }, []);

  return (
    <Container maxWidth="md" className={classes.container}>
      {groupedAlerts.length > 0 ? (
        <List>
          {groupedAlerts.map(group => (
            <ListItem key={group.infringementLabel} disableGutters>
              <AlertGroup
                {...group}
                setPeriodOnFocus={setPeriodOnFocus}
                setTab={setTab}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography className={classes.italicInfo}>
          Il n'y a aucune alerte réglementaire sur la période
        </Typography>
      )}
      <Divider className={`hr-unstyled ${classes.divider}`} />
      {newVersionGroupedAlerts.length > 0 ? (
        <List>
          {newVersionGroupedAlerts.map(group => (
            <ListItem key={group.infringementLabel} disableGutters>
              <AlertGroup
                {...group}
                setPeriodOnFocus={setPeriodOnFocus}
                setTab={setTab}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography className={classes.italicInfo}>
          Il n'y a aucune alerte réglementaire sur la période
        </Typography>
      )}
      <Divider className={`hr-unstyled ${classes.divider}`} />
      <Alert severity="warning">
        <Typography gutterBottom>
          Les données collectées par Mobilic sont déclaratives et sont donc
          susceptibles d'erreurs ou d'oublis. En cas de données manquantes ou
          inexactes les alertes réglementaires ne peuvent pas être remontées
          correctement.
        </Typography>
        <Typography>
          Mobilic sert à faciliter le travail d'enquête des inspecteurs sans se
          substituer à lui.
        </Typography>
      </Alert>
      <Box className={classes.linkContainer}>
        <Link
          color="primary"
          variant="body1"
          onClick={e => {
            e.preventDefault();
            setTab("history");
          }}
        >
          Voir l'historique
        </Link>
      </Box>
    </Container>
  );
}

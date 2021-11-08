import React from "react";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert/Alert";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Link } from "../../common/LinkButton";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import { AlertGroup } from "./AlertGroup";

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
  setPeriodOnFocus
}) {
  const classes = useStyles();

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
      <Divider className={classes.divider} />
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

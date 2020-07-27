import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useHistory } from "react-router-dom";
import Card from "@material-ui/core/Card";
import { ManagerIcon, TruckIcon } from "common/utils/icons";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  roleButton: {
    borderRadius: 1,
    textTransform: "none",
    maxWidth: 300
  },
  icon: {
    fontSize: 100
  },
  roleButtonText: {
    marginTop: theme.spacing(2)
  }
}));

export function RoleSelection() {
  const classes = useStyles();

  const history = useHistory();

  return [
    <Box key={0} mb={10}>
      <Typography variant="h3">Quel est votre métier ?</Typography>
    </Box>,
    <Grid
      key={1}
      style={{ overflowX: "hidden", overflowY: "auto" }}
      className="centered"
      container
      spacing={5}
      justify="space-around"
      alignItems="stretch"
    >
      <Grid item xs={10} md={4}>
        <Button
          onClick={() => history.push("/signup/user")}
          className={classes.roleButton}
        >
          <Card raised>
            <Box p={2} className="flex-column-space-between">
              <TruckIcon color="primary" className={classes.icon} />
              <Typography className={classes.roleButtonText}>
                Je suis travailleur mobile et je dois remplir le LIC
              </Typography>
            </Box>
          </Card>
        </Button>
      </Grid>
      <Grid item xs={10} md={4}>
        <Button
          onClick={() => history.push("/signup/admin")}
          className={classes.roleButton}
        >
          <Card raised>
            <Box p={2} className="flex-column-space-between">
              <ManagerIcon color="primary" className={classes.icon} />
              <Typography className={classes.roleButtonText}>
                Je suis gestionnaire d'une entreprise de transport
              </Typography>
            </Box>
          </Card>
        </Button>
      </Grid>
    </Grid>
  ];
}

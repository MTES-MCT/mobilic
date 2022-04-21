import React from "react";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import { ManagerImage, WorkerImage } from "common/utils/icons";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { LinkButton } from "../common/LinkButton";
import { PaperContainerTitle } from "../common/PaperContainer";

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

  return [
    <PaperContainerTitle key={0}>Quel est votre métier ?</PaperContainerTitle>,
    <Grid
      key={1}
      style={{
        overflowX: "hidden",
        overflowY: "auto",
        marginTop: 80,
        marginBottom: 0
      }}
      className="centered"
      container
      spacing={5}
      justifyContent="space-around"
      alignItems="stretch"
    >
      <Grid item xs={10} md={4}>
        <LinkButton
          aria-label="Inscription salarié"
          to="/signup/user"
          className={classes.roleButton}
        >
          <Card raised>
            <Box p={2} className="flex-column-space-between">
              <WorkerImage height={150} width={150} />
              <Typography className={classes.roleButtonText}>
                Je suis travailleur mobile et je dois remplir le LIC
              </Typography>
            </Box>
          </Card>
        </LinkButton>
      </Grid>
      <Grid item xs={10} md={4}>
        <LinkButton
          aria-label="Inscription gestionnaire"
          to="/signup/admin"
          className={classes.roleButton}
        >
          <Card raised>
            <Box p={2} className="flex-column-space-between">
              <ManagerImage height={150} width={150} />
              <Typography className={classes.roleButtonText}>
                Je suis gestionnaire d'une entreprise de transport
              </Typography>
            </Box>
          </Card>
        </LinkButton>
      </Grid>
    </Grid>
  ];
}

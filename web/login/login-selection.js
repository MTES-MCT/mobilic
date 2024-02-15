import React from "react";
import { useHistory } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { ControllerImage, WorkerImage } from "common/utils/icons";
import { Header } from "../common/Header";
import { LinkButton } from "../common/LinkButton";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { usePageTitle } from "../common/UsePageTitle";

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

export default function LoginSelection() {
  usePageTitle("Connexion - Mobilic");
  const history = useHistory();
  const classes = useStyles();

  return [
    <Header key={1} />,
    <PaperContainer key={2}>
      <Container className="centered" maxWidth="xs">
        <PaperContainerTitle>Se connecter en tant que</PaperContainerTitle>
        <Grid key={1} container justifyContent="space-evenly">
          <Grid item>
            <LinkButton
              aria-label="Entreprise ou salarié"
              to="/login"
              className={classes.roleButton}
            >
              <Card raised>
                <Box p={2} className="flex-column-space-between">
                  <WorkerImage height={150} width={150} />
                  <Typography className={classes.roleButtonText}>
                    Je suis travailleur mobile ou gestionnaire d'une entreprise
                    de transport
                  </Typography>
                </Box>
              </Card>
            </LinkButton>
          </Grid>
          <Grid item>
            <LinkButton
              aria-label="Contrôleur"
              to="/controller-login"
              className={classes.roleButton}
            >
              <Card raised>
                <Box p={2} className="flex-column-space-between">
                  <ControllerImage height={150} width={150} />
                  <Typography className={classes.roleButtonText}>
                    Je suis Agent public de l'État et je me connecte à mon
                    espace dédié
                  </Typography>
                </Box>
              </Card>
            </LinkButton>
          </Grid>
          <Grid item>
            <Typography key={2}>
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                onClick={e => {
                  e.preventDefault();
                  history.push("/signup");
                }}
              >
                {" "}
                Je m'inscris
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </PaperContainer>
  ];
}

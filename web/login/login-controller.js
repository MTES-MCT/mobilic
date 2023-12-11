import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material";
import {
  buildAgentConnectCallbackUrl,
  buildAgentConnectUrl
} from "../controller/utils/agentConnect";
import { AgentConnectImage } from "common/utils/icons";
import { usePageTitle } from "../common/UsePageTitle";

const useStyles = makeStyles(theme => ({
  agentConnectButton: {
    marginTop: theme.spacing(3)
  },
  infoLink: {
    marginTop: theme.spacing(1),
    display: "block"
  },
  alertInfo: {
    marginTop: theme.spacing(3),
    textAlign: "left"
  },
  informationText: {
    fontStyle: "italic",
    fontSize: "small"
  }
}));

export default function LoginController() {
  usePageTitle("Connexion Agent - Mobilic");
  const classes = useStyles();

  const clickAgentConnect = () => {
    const callbackUrl = buildAgentConnectCallbackUrl();
    window.location.href = buildAgentConnectUrl(callbackUrl);
  };

  return [
    <Header key={1} />,
    <PaperContainer key={2}>
      <Container className="centered" maxWidth="xs">
        <PaperContainerTitle>Connexion Contrôleur</PaperContainerTitle>
        <Typography>
          Je me connecte avec mon identifiant Cerbère grâce à{" "}
          <b>AgentConnect</b>
        </Typography>
        <Button
          aria-label="Agent Connect"
          className={classes.agentConnectButton}
          onClick={clickAgentConnect}
        >
          <AgentConnectImage />
        </Button>
        <Link
          className={classes.infoLink}
          variant="body1"
          href="https://agentconnect.gouv.fr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Qu'est-ce que AgentConnect ?
        </Link>
        <Alert severity="info" className={classes.alertInfo}>
          <Typography className={classes.informationText}>
            Vous n'avez pas de compte Mobilic à créer.
          </Typography>
          <Typography className={classes.informationText}>
            AgentConnect vous permet de vous connecter à Mobilic avec votre
            compte Cerbère
          </Typography>
        </Alert>
      </Container>
    </PaperContainer>
  ];
}

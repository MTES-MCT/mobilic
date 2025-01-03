import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { PaperContainerTitle } from "../common/PaperContainer";
import {
  buildAgentConnectCallbackUrl,
  buildAgentConnectUrl
} from "../controller/utils/agentConnect";
import { usePageTitle } from "../common/UsePageTitle";
import Notice from "../common/Notice";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { Main } from "../common/semantics/Main";

const useStyles = makeStyles(theme => ({
  agentConnectButton: {
    marginTop: theme.spacing(3)
  },
  infoLink: {
    marginTop: theme.spacing(1),
    display: "block"
  },
  informationText: {
    fontStyle: "italic"
  }
}));

export default function LoginController() {
  usePageTitle("Connexion Agent - Mobilic");
  const classes = useStyles();

  const clickAgentConnect = () => {
    const callbackUrl = buildAgentConnectCallbackUrl();
    window.location.href = buildAgentConnectUrl(callbackUrl);
  };

  return (
    <>
      <Header />
      <Main>
        <Container
          className="centered"
          maxWidth="xs"
          sx={{ textAlign: "center" }}
        >
          <PaperContainerTitle>Connexion Contrôleur</PaperContainerTitle>
          <Typography>
            Je me connecte avec mon identifiant Cerbère grâce à{" "}
            <b>ProConnect</b>
          </Typography>
          <ProConnectButton
            className={classes.agentConnectButton}
            onClick={clickAgentConnect}
          />
          <Notice
            sx={{ marginTop: 3 }}
            size="small"
            classes={{
              description: classes.informationText
            }}
            description={
              <>
                Vous n'avez pas de compte Mobilic à créer. ProConnect vous
                permet de vous connecter à Mobilic avec votre compte Cerbère
              </>
            }
          />
        </Container>
      </Main>
    </>
  );
}

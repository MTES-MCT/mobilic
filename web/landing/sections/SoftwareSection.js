import React from "react";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles((theme) => ({
  linkButton: {
    textDecoration: "underline",
    textUnderlineOffset: "6px",
  },
  highlightedText: {
    color: "#3965EA",
  },
}));

export function SoftwareSection() {
  const classes = useStyles();

  return (
    <OuterContainer grayBackground>
      <InnerContainer>
        <Stack direction="column" rowGap={4}>
          <Typography variant="h3" component="h2">
            Je suis{" "}
            <span className={classes.highlightedText}>
              éditeur de logiciels
            </span>
            , pourquoi m’interconnecter avec l’API Mobilic ?
          </Typography>
          <Box>
            <ul>
              <li>
                Une mise en conformité réglementaire de votre logiciel métier
              </li>
              <li>
                L’utilisation d’un seul logiciel par les entreprises : le vôtre
              </li>
              <li>Moins de gestion administrative pour vos clients</li>
            </ul>
          </Box>
          <Button>Découvrir l’API</Button>
          {/* https://developers.mobilic.beta.gouv.fr/ */}
        </Stack>
      </InnerContainer>
    </OuterContainer>
  );
}

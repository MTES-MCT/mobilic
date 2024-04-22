import React from "react";
import Container from "@mui/material/Container";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { Footer } from "./footer";
import { usePageTitle } from "../common/UsePageTitle";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    margin: "auto",
    textAlign: "left"
  }
}));

export default function LegalNotices() {
  return [<Header key={1} />, <Notices key={2} />, <Footer key={3} />];
}

function Notices() {
  usePageTitle("Mentions légales - Mobilic");
  const classes = useStyles();

  return (
    <Container className={classes.container} maxWidth="lg">
      <h1>Mentions légales</h1>
      <Stack direction="column" spacing={4}>
        <Box>
          <h2>Éditeur de la plateforme</h2>
          <Typography sx={{ marginBottom: 2 }}>
            La Direction générale des infrastructures, des transports et des
            mobilités (<b>DGITM</b>) , située :
          </Typography>
          <address>
            Tour Séquoia<br></br>1 place Carpeaux<br></br>
            92800 Puteaux<br></br>
            France
          </address>
        </Box>
        <Box>
          <h2>Directeur de la publication</h2>
          <Typography>
            <b>Monsieur Rodolphe GINTZ</b>, directeur général des
            infrastructures, des transports et des mobilités.
          </Typography>
        </Box>
        <Box>
          <h2>Hébergement de la plateforme</h2>
          <Typography sx={{ marginBottom: 2 }}>
            <b>Scalingo</b>
          </Typography>
          <address>
            13 rue Jacques Peirotes<br></br>67000 Strasbourg<br></br>
            France
          </address>
        </Box>
      </Stack>
    </Container>
  );
}

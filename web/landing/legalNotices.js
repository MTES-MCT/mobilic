import React from "react";
import { usePageTitle } from "../common/UsePageTitle";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { FullPageComponent } from "./components/FullPageComponent";

export default function LegalNotices() {
  return (
    <FullPageComponent>
      <Notices />
    </FullPageComponent>
  );
}

function Notices() {
  usePageTitle("Mentions légales - Mobilic");

  return (
    <>
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
    </>
  );
}

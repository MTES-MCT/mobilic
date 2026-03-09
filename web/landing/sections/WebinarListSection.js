import React from "react";
import Typography from "@mui/material/Typography";
import { WebinarList } from "../components/WebinarList";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";
import { Stack } from "@mui/material";

export function WebinarListSection() {
  const [
    cantDisplayWebinarsBecauseNoneOrError,
    setCantDisplayWebinarsBecauseNoneOrError,
  ] = React.useState();

  if (cantDisplayWebinarsBecauseNoneOrError) return null;

  return (
    <OuterContainer id="webinaires">
      <InnerContainer>
        <Stack direction="column" rowGap={2}>
          <Typography variant="h3" component="h2">
            Découvrez Mobilic lors d’un webinaire
          </Typography>
          <Typography>
            Inscrivez-vous à l’un de nos webinaires pour assister à une
            démonstration de l’usage de Mobilic et obtenir toutes les réponses à
            vos questions :
          </Typography>
          <WebinarList
            setCantDisplayWebinarsBecauseNoneOrError={
              setCantDisplayWebinarsBecauseNoneOrError
            }
          />
        </Stack>
      </InnerContainer>
    </OuterContainer>
  );
}

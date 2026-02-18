import React from "react";
import { VideoFrame, VIDEOS } from "../ResourcePage/VideoCard";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ExternalLink } from "../../common/ExternalLink";
import { LinkButton } from "../../common/LinkButton";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  linkButton: {
    textDecoration: "underline",
    textUnderlineOffset: "6px",
    padding: 0,
  },
}));

const Title = () => {
  return (
    <Typography variant="h3" component="h2">
      À qui s'adresse Mobilic ?
    </Typography>
  );
};

export function VideoSection() {
  const classes = useStyles();

  const { id, title } = VIDEOS.Home_Mobilic;
  return (
    <OuterContainer grayBackground>
      <InnerContainer>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={2}
          rowGap={4}
          justifyContent="space-between"
        >
          <Stack direction="column" maxWidth="750px">
            <Title />
            <Stack direction="column" rowGap={2} mt={2}>
              <Typography>
                Aux entreprises dont les salariés (conducteurs et accompagnants)
                utilisent des <b>véhicules utilitaires légers</b> (-3,5t ou -9
                places) dans le cadre de transport routier de marchandises
                (dernier kilomètre, déménagement, ...) ou de voyageurs (taxi,
                VTC, LOTI), conformément aux articles{" "}
                <ExternalLink
                  text="R.3312-19"
                  url="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043651220"
                />{" "}
                et{" "}
                <ExternalLink
                  text="R.3312-58"
                  url="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043651176"
                />{" "}
                du code des transports.
              </Typography>
              <Typography color="#7B7B7B" fontSize="0.875rem">
                Sont exclues les opérations de transport international ou de
                cabotage de marchandises effectuées par des véhicules de plus de
                2,5 tonnes.
              </Typography>
              <Typography>
                <span style={{ fontWeight: 500 }}>
                  Mettre en place Mobilic c’est :
                </span>
                <ul>
                  <li>Moins de gestion administrative</li>
                  <li>Une mise en conformité réglementaire</li>
                </ul>
              </Typography>
            </Stack>
            <LinkButton
              to="/#webinaires"
              priority="tertiary-no-outline"
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
              size="medium"
              className={classes.linkButton}
            >
              Découvrir Mobilic lors d’un webinaire
            </LinkButton>
          </Stack>
          <Stack
            direction="column"
            flex={1}
            maxWidth="356px"
            minWidth="310px"
            rowGap={2}
          >
            <Typography component="h3" fontSize="1.25rem" fontWeight="700">
              Mobilic c’est quoi ?
            </Typography>
            <Box position="relative" maxWidth="356px" minHeight="310px">
              <VideoFrame id={id} title={title} />
            </Box>
          </Stack>
        </Stack>
      </InnerContainer>
    </OuterContainer>
  );
}

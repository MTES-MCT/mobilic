import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Breadcrumb, BreadcrumbItem } from "@dataesr/react-dsfr";
import { SlideshareCard } from "./SlideshareCard";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { VideoCard } from "./VideoCard";

export function ControllerResourcePage() {
  const classes = resourcePagesClasses();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Breadcrumb>
          <BreadcrumbItem href="/resources/home">Documentation</BreadcrumbItem>
          <BreadcrumbItem>Contrôleur</BreadcrumbItem>
        </Breadcrumb>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Je suis contrôleur
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item sm={6}>
            <Box>
              <SlideshareCard
                description="Notice d'utilisation"
                slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/IFxeyHjtJwJuiY/"
                downloadLink="https://drive.google.com/uc?id=1prafJTJ5Q6uAFW5XQu-nUgB7d61ID-g7&export=download"
              />
            </Box>
            <Button
              color="primary"
              size="small"
              className={classes.viewAllButton}
              variant={"outlined"}
              href="https://drive.google.com/drive/folders/1b87UFjE7BL-nk-dQy_Seghs1gcgBB-A8"
              target="_blank"
            >
              Voir toutes les notices
            </Button>
          </Grid>
          <Grid item sm={6}>
            <Box>
              <VideoCard
                description="Effectuer un contrôle en bord de route"
                youtubeUrl={"https://www.youtube.com/embed/K6weRB_k7HA"}
              />
            </Box>
            <Button
              color="primary"
              size="small"
              className={classes.viewAllButton}
              variant={"outlined"}
              href="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg/videos"
              target="_blank"
            >
              Voir toutes les vidéos
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Container
      key={3}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite diffuser Mobilic auprès de mes collègues et des
          entreprises que je contrôle
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item sm={6}>
            <SlideshareCard
              description="Brochure"
              slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/HQst1i4BajjQVg/"
              downloadLink="https://drive.google.com/uc?id=1mNR2levAhZd8-MGaidRe035Xj0Fa3dRO&export=download"
            />
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

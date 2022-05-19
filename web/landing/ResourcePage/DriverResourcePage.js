import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import Button from "@mui/material/Button";
import { VideoCard } from "./VideoCard";
import { Breadcrumb, BreadcrumbItem } from "@dataesr/react-dsfr";
import Box from "@mui/material/Box";
import { SlideshareCard } from "./SlideshareCard";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";

export function DriverResourcePage() {
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
          <BreadcrumbItem>Travailleur mobile</BreadcrumbItem>
        </Breadcrumb>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Je suis travailleur mobile
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={6}>
            <Box>
              <SlideshareCard
                description="Notice d'utilisation"
                slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/acEhSEf8PbwBCK/"
                downloadLink="https://drive.google.com/uc?id=1Dy5hZosWwKGDHziksKC2OnTHoJx4YCbN&export=download"
              />
            </Box>
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
        <Grid container direction="row" alignItems="center" spacing={10}>
          <Grid item xs={12} sm={6}>
            <VideoCard
              description="Inscription sur Mobilic"
              youtubeUrl={"https://www.youtube.com/embed/sWG_jcE0amk"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <VideoCard
              description="Télécharger Mobilic sur Android"
              youtubeUrl={"https://www.youtube.com/embed/g-XNdxVVjO8"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <VideoCard
              description="Télécharger Mobilic sur iPhone"
              youtubeUrl={"https://www.youtube.com/embed/DMVKSGxoMzU"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <VideoCard
              description="Utiliser Mobilic au quotidien"
              youtubeUrl={"https://www.youtube.com/embed/xj6PhWxKR5k"}
            />
          </Grid>
        </Grid>
        <Button
          color="primary"
          size="small"
          className={classes.viewAllButton}
          variant={"outlined"}
          href="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg/videos"
        >
          Voir toutes les vidéos
        </Button>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

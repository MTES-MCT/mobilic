import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import Button from "@material-ui/core/Button";
import { VideoCard } from "./VideoCard";
import { Breadcrumbs } from "@material-ui/core";
import { Link } from "../../common/LinkButton";
import { SlideshareCard } from "./SlideshareCard";
import Box from "@material-ui/core/Box";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";

export function AdminResourcePage() {
  const classes = resourcePagesClasses();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Breadcrumbs>
          <Link color="inherit" to="/resources/home">
            Documentation
          </Link>
          <Typography>Gestionnaire</Typography>
        </Breadcrumbs>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Je suis gestionnaire
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={6}>
            <VideoCard
              description="Vous inscrire sur Mobilic"
              youtubeUrl={"https://www.youtube.com/embed/vu-0wkydqzs"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <VideoCard
              description="Utiliser l'interface gestionnaire"
              youtubeUrl={"https://www.youtube.com/embed/_USTJ2SHhUQ"}
            />
          </Grid>
        </Grid>
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
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={6}>
            <Box>
              <SlideshareCard
                description="Notice d'utilisation"
                slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/ekolaAOzyCYqo2/"
                downloadLink="https://drive.google.com/uc?id=1Hjvv8idh38t2L-sOfRirtKtovxZsvXP9&export=download"
              />
            </Box>
            <Button
              color="primary"
              size="small"
              className={classes.viewAllButton}
              variant={"outlined"}
              href="https://drive.google.com/drive/folders/1xc1tvfWNoTksyuIANnUXvUh9RrD1utHF"
            >
              Voir toutes les notices
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
          Je cherche une notice d'utilisation pour mes salariés
        </Typography>
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
          href="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg"
          target="_blank"
        >
          Voir toutes les vidéos
        </Button>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={6}>
            <Box>
              <SlideshareCard
                description="Notice d'utilisation"
                slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/mloxFeuB3sLZon/"
                downloadLink="https://drive.google.com/uc?id=1vSuHhFWAoF2ozXV02u8xMwtcnhmttCs-&export=download"
              />
            </Box>
            <Button
              color="primary"
              size="small"
              className={classes.viewAllButton}
              variant={"outlined"}
              href="https://drive.google.com/drive/folders/1xc1tvfWNoTksyuIANnUXvUh9RrD1utHF"
            >
              Voir toutes les notices
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

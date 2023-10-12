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
import { SlideshareCard } from "./SlideshareCard";
import Box from "@mui/material/Box";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { RESOURCES_DOCUMENT } from "./ResourcePage";
import { DriverVideoSection } from "./DriverVideoSection";

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
        <Breadcrumb>
          <BreadcrumbItem href="/resources/home">Documentation</BreadcrumbItem>
          <BreadcrumbItem>Gestionnaire</BreadcrumbItem>
        </Breadcrumb>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Je suis gestionnaire
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={6}>
            <VideoCard
              id="873641619"
              title="gestionnaire-inscription"
              description="Vous inscrire sur Mobilic"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <VideoCard
              id="873641999"
              title="gestionnaire-utilisation"
              description="Utiliser l'interface gestionnaire"
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
                slideshareUrl={
                  RESOURCES_DOCUMENT.noticeUtilisation.gestionnaire.slideshare
                }
                downloadLink={
                  RESOURCES_DOCUMENT.noticeUtilisation.gestionnaire.download
                }
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
        <DriverVideoSection buttonStyle={classes.viewAllButton} />
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={6}>
            <Box>
              <SlideshareCard
                description="Notice d'utilisation"
                slideshareUrl={
                  RESOURCES_DOCUMENT.noticeUtilisation.salarie.slideshare
                }
                downloadLink={
                  RESOURCES_DOCUMENT.noticeUtilisation.salarie.download
                }
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

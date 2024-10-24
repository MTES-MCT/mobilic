import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { VIDEOS, VideoCard } from "./VideoCard";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { SlideshareCard } from "./SlideshareCard";
import Box from "@mui/material/Box";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { RESOURCES_DOCUMENT } from "./ResourcePage";
import { DriverVideoSection } from "./DriverVideoSection";
import { usePageTitle } from "../../common/UsePageTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function AdminResourcePage() {
  usePageTitle("Documentation Gestionnaire - Mobilic");
  const classes = resourcePagesClasses();

  return (
    <>
      <Header />
      <Container
        className={`${classes.container} ${classes.whiteSection}`}
        maxWidth={false}
      >
        <Container maxWidth="xl" className={classes.inner}>
          <Breadcrumb
            currentPageLabel="Gestionnaire"
            homeLinkProps={{
              to: "/"
            }}
            segments={[
              {
                label: "Documentation",
                linkProps: {
                  to: "/resources/home"
                }
              }
            ]}
          />
          <PaperContainerTitle variant="h1" className={classes.title}>
            Je suis gestionnaire
          </PaperContainerTitle>
          <Typography variant={"h3"} className={classes.resourceSubtitle}>
            Je souhaite apprendre à utiliser Mobilic
          </Typography>
          <Grid container direction="row" alignItems="stretch" spacing={10}>
            <Grid item xs={12} sm={6}>
              <VideoCard video={VIDEOS.Admin_Inscription} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <VideoCard video={VIDEOS.Admin_Utilisation} />
            </Grid>
          </Grid>
          <Button
            priority="secondary"
            size="small"
            className={classes.viewAllButton}
            linkProps={{
              href:
                "https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg/videos",
              target: "_blank"
            }}
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
                size="small"
                className={classes.viewAllButton}
                priority="secondary"
                linkProps={{
                  href:
                    "https://drive.google.com/drive/folders/1xc1tvfWNoTksyuIANnUXvUh9RrD1utHF"
                }}
              >
                Voir toutes les notices
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Container>
      <Container
        className={`${classes.container} ${classes.whiteSection}`}
        maxWidth={false}
      >
        <Container maxWidth="xl" className={classes.inner}>
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
                priority="secondary"
                size="small"
                className={classes.viewAllButton}
                linkProps={{
                  href:
                    "https://drive.google.com/drive/folders/1xc1tvfWNoTksyuIANnUXvUh9RrD1utHF"
                }}
              >
                Voir toutes les notices
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Container>
      <Footer />
    </>
  );
}

import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { SlideshareCard } from "./SlideshareCard";
import Box from "@mui/material/Box";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { VideoCard, VIDEOS } from "./VideoCard";
import { RESOURCES_DOCUMENT } from "./ResourcePage";
import { usePageTitle } from "../../common/UsePageTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function ControllerResourcePage() {
  usePageTitle("Documentation Contrôleur - Mobilic");
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
            currentPageLabel="Contrôleur"
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
            Je suis contrôleur
          </PaperContainerTitle>
          <Typography variant={"h3"} className={classes.resourceSubtitle}>
            Je suis contrôleur des transports terrestres ou inspecteur du
            travail, et j'apprends à utiliser Mobilic
          </Typography>
          <Grid container direction="row" alignItems="stretch" spacing={10}>
            <Grid item sm={6}>
              <Box>
                <SlideshareCard
                  description="Notice d'utilisation"
                  slideshareUrl={
                    RESOURCES_DOCUMENT.noticeUtilisation.controleurConnected
                      .slideshare
                  }
                  downloadLink={
                    RESOURCES_DOCUMENT.noticeUtilisation.controleurConnected
                      .download
                  }
                />
              </Box>
              <Button
                priority="secondary"
                size="small"
                className={classes.viewAllButton}
                linkProps={{
                  href:
                    "https://drive.google.com/drive/folders/1b87UFjE7BL-nk-dQy_Seghs1gcgBB-A8",
                  target: "_blank"
                }}
              >
                Voir toutes les notices
              </Button>
            </Grid>
            <Grid item sm={6}>
              <Box>
                <VideoCard video={VIDEOS.Tuto_Ctt} />
              </Box>
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
            </Grid>
          </Grid>
          <Typography
            variant={"h3"}
            className={classes.itAgentResourceSubtitle}
          >
            Je fais partie des forces en tenue et j'apprends à utiliser Mobilic
          </Typography>
          <Grid container direction="row" alignItems="stretch" spacing={10}>
            <Grid item sm={6}>
              <Box>
                <SlideshareCard
                  description="Notice d'utilisation"
                  slideshareUrl={
                    RESOURCES_DOCUMENT.noticeUtilisation.controleur.slideshare
                  }
                  downloadLink={
                    RESOURCES_DOCUMENT.noticeUtilisation.controleur.download
                  }
                />
              </Box>
              <Button
                priority="secondary"
                size="small"
                className={classes.viewAllButton}
                linkProps={{
                  href:
                    "https://drive.google.com/drive/folders/1b87UFjE7BL-nk-dQy_Seghs1gcgBB-A8",
                  target: "_blank"
                }}
              >
                Voir toutes les notices
              </Button>
            </Grid>
            <Grid item sm={6}>
              <Box>
                <VideoCard video={VIDEOS.Tuto_Police} />
              </Box>
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
            Je souhaite diffuser Mobilic auprès de mes collègues et des
            entreprises que je contrôle
          </Typography>
          <Grid container direction="row" alignItems="stretch" spacing={10}>
            <Grid item sm={6}>
              <SlideshareCard
                description="Brochure"
                slideshareUrl={RESOURCES_DOCUMENT.brochure.slideshare}
                downloadLink={RESOURCES_DOCUMENT.brochure.download}
              />
            </Grid>
          </Grid>
        </Container>
      </Container>
      <Footer />
    </>
  );
}

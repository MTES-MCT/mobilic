import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Breadcrumbs } from "@material-ui/core";
import { Link } from "../../common/LinkButton";
import { SlideshareCard } from "./SlideshareCard";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";

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
        <Breadcrumbs>
          <Link color="inherit" to="/resources/home">
            Documentation
          </Link>
          <Typography>Contrôleur</Typography>
        </Breadcrumbs>
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
                slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/xMyGOhLCCvjosE/"
                downloadLink="https://drive.google.com/uc?id=1yT9wet3o6QQDB2AbFJM-ES7zxS-5LyY9&export=download"
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
              slideshareUrl="https://www.slideshare.net/slideshow/embed_code/key/4SH8rJFBbPCEhW/"
              downloadLink="https://drive.google.com/uc?id=13bk6z4fgZ9RUvNjf-T1eufoZ_JQEAw_Y&export=download"
            />
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import Button from "@material-ui/core/Button";
import { VideoCard } from "./VideoCard";
import { Breadcrumbs } from "@material-ui/core";
import { PdfFileImage } from "common/utils/icons";
import { IconCard } from "./IconCard";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: 0
  },
  inner: {
    margin: "auto",
    padding: 0,
    textAlign: "left"
  },
  title: {
    marginBottom: theme.spacing(6)
  },
  resourceSubtitle: {
    marginBottom: theme.spacing(3)
  },
  faqButton: {
    float: "right",
    marginTop: theme.spacing(2)
  }
}));

export function DriverResourcePage() {
  const classes = useStyles();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Breadcrumbs>
          <Link color="inherit" href="/resources/home">
            Documentation
          </Link>
          <Typography>Travailleur mobile</Typography>
        </Breadcrumbs>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Je suis travailleur mobile
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={8}>
          <Grid item sm={4}>
            <IconCard
              link="https://drive.google.com/drive/folders/1IVzAKkQfKOtl4HPOt0-JpO-uAPzLlCZb"
              description="Notice d'utilisation"
              IconComponent={PdfFileImage}
            />
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
        <Grid container direction="row" alignItems="center" spacing={8}>
          <Grid item xs={12} sm={4}>
            <VideoCard
              description="Inscription sur Mobilic"
              youtubeUrl={"https://www.youtube.com/embed/sWG_jcE0amk"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VideoCard
              description="Télécharger Mobilic sur Android"
              youtubeUrl={"https://www.youtube.com/embed/g-XNdxVVjO8"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VideoCard
              description="Télécharger Mobilic sur iPhone"
              youtubeUrl={"https://www.youtube.com/embed/DMVKSGxoMzU"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VideoCard
              description="Utiliser Mobilic au quotidien"
              youtubeUrl={"https://www.youtube.com/embed/xj6PhWxKR5k"}
            />
            <Button
              color="primary"
              size="small"
              className={classes.faqButton}
              variant={"outlined"}
              href="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg/videos"
            >
              Voir toutes les vidéos
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

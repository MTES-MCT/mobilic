import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
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

export function ControllerResourcePage() {
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
          <Typography>Contrôleur</Typography>
        </Breadcrumbs>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Je suis contrôleur
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={8}>
          <Grid item sm={3}>
            <IconCard
              link="https://drive.google.com/drive/folders/1aE9sb8durZEtc4r_ixRwjQVgx4mcq8o_"
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
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je souhaite diffuser Mobilic auprès de mes collègues et des
          entreprises que je contrôle
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={8}>
          <Grid item sm={3}>
            <IconCard
              link="https://drive.google.com/drive/folders/1aE9sb8durZEtc4r_ixRwjQVgx4mcq8o_"
              description="Brochure"
              IconComponent={PdfFileImage}
            />
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

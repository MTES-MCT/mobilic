import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { DriverVideoSection } from "./DriverVideoSection";
import { Breadcrumb, BreadcrumbItem } from "@dataesr/react-dsfr";
import Box from "@mui/material/Box";
import { SlideshareCard } from "./SlideshareCard";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { RESOURCES_DOCUMENT } from "./ResourcePage";
import { usePageTitle } from "../../common/UsePageTitle";

export function DriverResourcePage() {
  usePageTitle("Documentation Travailleur Mobile - Mobilic");
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
                slideshareUrl={
                  RESOURCES_DOCUMENT.noticeUtilisation.salarie.slideshare
                }
                downloadLink={
                  RESOURCES_DOCUMENT.noticeUtilisation.salarie.download
                }
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
        <DriverVideoSection buttonStyle={classes.viewAllButton} />
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}

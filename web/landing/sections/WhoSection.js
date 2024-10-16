import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ManagerImage, SoftwareImage, WorkerImage } from "common/utils/icons";
import { useIsWidthDown } from "common/utils/useWidth";
import { LoadingButton } from "common/components/LoadingButton";
import { LandingSection, useSectionStyles } from "./LandingSection";

const useStyles = makeStyles(theme => ({
  lightBlue: {
    backgroundColor: "#b4e1fa"
  },
  subDescription: {
    fontStyle: "italic"
  },
  cta: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

function Showcase({
  image,
  imageDescription,
  imageSubDescription,
  imagePosition,
  descriptionTitle,
  descriptionContent,
  ctaTarget,
  ctaLabel,
  titleProps = {},
  width
}) {
  const classes = useStyles();

  const Image = props => (
    <Grid container direction="column" spacing={1} alignItems="center">
      <Grid item>{image}</Grid>
      <Grid item>
        <Typography
          className="bold"
          variant="h4"
          color="primary"
          {...titleProps}
        >
          {imageDescription}
        </Typography>
        <Typography className={classes.subDescription} variant="body2">
          {imageSubDescription}
        </Typography>
      </Grid>
    </Grid>
  );

  const Description = props => [
    <Typography
      align="left"
      variant="h4"
      key={0}
      className="bold"
      component="span"
    >
      {descriptionTitle}
    </Typography>,
    <React.Fragment key={1}>{descriptionContent}</React.Fragment>,
    <LoadingButton key={2} className={classes.cta} href={ctaTarget}>
      {ctaLabel}
    </LoadingButton>
  ];

  const isMdDown = useIsWidthDown("md");
  const leftAlignImage = isMdDown || imagePosition === "left";

  return (
    <Grid
      container
      alignItems="center"
      direction="row"
      spacing={4}
      justifyContent="space-between"
    >
      <Grid
        item
        xs={leftAlignImage ? true : null}
        sm={leftAlignImage ? null : true}
      >
        {leftAlignImage ? <Image /> : <Description />}
      </Grid>
      <Grid
        item
        sm={leftAlignImage ? true : null}
        xs={leftAlignImage ? null : true}
      >
        {leftAlignImage ? <Description /> : <Image />}
      </Grid>
    </Grid>
  );
}

export const WhoSection = () => {
  const classes = useStyles();
  const sectionClasses = useSectionStyles();

  return (
    <LandingSection
      title="A qui s'adresse Mobilic ?"
      titleProps={{ component: "h2" }}
    >
      <Typography className={sectionClasses.sectionIntroText}>
        Mobilic s'adresse aux conducteurs des entreprises de transport routier
        qui utilisent des véhicules utilitaires légers (VUL, {"<"} 3.5T), et aux
        autres{" "}
        <strong>
          personnels roulants qui sont soumis au livret individuel de contrôle
          (LIC)
        </strong>{" "}
        conformément aux articles R. 3312-19, 2° et R. 3312-58, 2° du code des
        transports : déménagement, messagerie, fret express, transport de
        personnes.
      </Typography>
      <Box className={`${classes.lightBlue}`} p={2}>
        <Showcase
          image={<WorkerImage height={200} width={200} />}
          imagePosition="left"
          imageDescription="Travailleur mobile"
          imageSubDescription="Conducteurs et autres personnels roulants"
          descriptionTitle="Suivre simplement mon temps de travail et être mieux informé(e) sur mes droits"
          descriptionContent={
            <div
              style={{
                textAlign: "left",
                fontSize: "1rem",
                lineHeight: "1.6"
              }}
            >
              <p>Directement depuis mon téléphone</p>
              <ul
                style={{
                  textAlign: "justify",
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}
              >
                <li>
                  Enregistrer de manière simple et rapide mon temps de travail
                  et mes frais
                </li>
                <li>Accéder à tout moment à mon relevé d'heures et de frais</li>
              </ul>
            </div>
          }
          ctaLabel="M'inscrire comme travailleur mobile"
          ctaTarget="/signup/user"
          titleProps={{ component: "h3" }}
        />
      </Box>
      <Box p={2}>
        <Showcase
          image={<ManagerImage height={200} width={200} />}
          imagePosition="right"
          imageDescription="Gestionnaire"
          imageSubDescription="Responsables d'exploitation, dirigeant(e)s"
          descriptionTitle="Gérer facilement le temps de travail des salarié(e)s de mon entreprise"
          descriptionContent={
            <ul
              style={{
                textAlign: "justify",
                fontSize: "1rem",
                lineHeight: "1.6"
              }}
            >
              <li>
                Alléger la gestion administrative des données sociales de mon
                entreprise en évitant la double saisie des informations
              </li>
              <li>
                Optimiser l'organisation de mes équipes en accédant aux données
                sociales en temps réel
              </li>
            </ul>
          }
          ctaLabel="M'inscrire comme gestionnaire"
          ctaTarget="/signup/admin"
          titleProps={{ component: "h3" }}
        />
      </Box>
      <Box className={classes.lightBlue} p={2}>
        <Showcase
          image={<SoftwareImage height={200} width={200} />}
          imagePosition="left"
          imageDescription="Logiciel métier"
          descriptionTitle="Echanger en temps réel avec l'API Mobilic des données sociales clés pour la gestion du personnel"
          descriptionContent={
            <ul
              style={{
                textAlign: "justify",
                fontSize: "1rem",
                lineHeight: "1.6"
              }}
            >
              <li>
                Enrichir mon logiciel avec les données sociales, accessibles
                sans délai
              </li>
              <li>
                Garantir la conformité réglementaire de mes entreprises clientes
              </li>
            </ul>
          }
          ctaLabel="Découvrir l'API"
          ctaTarget="https://developers.mobilic.beta.gouv.fr/"
          titleProps={{ component: "h3" }}
        />
      </Box>
    </LandingSection>
  );
};

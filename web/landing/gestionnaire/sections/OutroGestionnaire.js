import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import React from "react";
import { ComputerImage } from "common/utils/icons";
import Typography from "@mui/material/Typography";
import { useIsWidthUp } from "common/utils/useWidth";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ADMIN_LANDING_CONTACT } from "common/utils/matomoTags";
import { LinkButton } from "../../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: `${theme.palette.primary.main}21`
  },
  image: {
    height: "300px",
    width: "490px"
  },
  title: {
    fontSize: "2rem",
    lineHeight: "2.5rem",
    fontWeight: "400",
    color: "black",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    marginTop: theme.spacing(2)
  },
  stackContainer: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  button: {
    margin: "auto"
  }
}));

export function OutroGestionnaire() {
  const isOnDesktop = useIsWidthUp("lg");
  const classes = useStyles();
  const { trackEvent } = useMatomo();
  return (
    <Container maxWidth="xl" className={classes.container}>
      <Stack direction="row" className={classes.stackContainer}>
        {isOnDesktop && <ComputerImage className={classes.image} />}
        <Stack direction="column" gap={4}>
          <Typography className={classes.title}>
            <b>Mobilic,</b> c'est une gestion administrative simplifiée et{" "}
            <b>
              une&nbsp;entreprise&nbsp;conforme à&nbsp;la&nbsp;réglementation
            </b>
          </Typography>
          <LinkButton
            className={classes.button}
            priority="secondary"
            aria-label="Nous contacter"
            to="mailto:contact@mobilic.beta.gouv.fr"
            onClick={() => trackEvent(ADMIN_LANDING_CONTACT)}
          >
            J’ai une question pour l’équipe Mobilic
          </LinkButton>
        </Stack>
      </Stack>
    </Container>
  );
}

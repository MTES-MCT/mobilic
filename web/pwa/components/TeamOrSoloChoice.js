import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import { makeStyles } from "@mui/styles";
import { PersonIcon, TeamIcon } from "common/utils/icons";
import ButtonBase from "@mui/material/ButtonBase";

const useStyles = makeStyles(theme => ({
  card: {
    width: 160,
    cursor: "pointer"
  },
  right: {
    marginLeft: theme.spacing(1)
  },
  left: {
    marginRight: theme.spacing(1)
  },
  content: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  icon: {
    fontSize: 80
  },
  explanationText: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: "justify"
  },
  explanationTitle: {
    fontWeight: "bold"
  }
}));

export default function TeamOrSoloChoiceModal({
  open,
  handleClose,
  handleContinue
}) {
  const classes = useStyles();
  const funnelModalClasses = useFunnelModalStyles();
  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <Container className={funnelModalClasses.slimContainer} disableGutters>
          <Typography
            className={funnelModalClasses.title}
            variant="h5"
            component="p"
          >
            Pour qui enregistrez-vous le temps de travail&nbsp;?
          </Typography>
          <Box mt={3} mb={6} className="flex-row-center">
            <ButtonBase onClick={() => handleContinue(false)}>
              <Card className={`${classes.card} ${classes.left}`}>
                <CardContent
                  className={`flex-column-space-between ${classes.content}`}
                >
                  <PersonIcon color="primary" className={classes.icon} />
                  <Typography className="bold" color="primary">
                    Moi
                  </Typography>
                </CardContent>
              </Card>
            </ButtonBase>
            <ButtonBase onClick={() => handleContinue(true)}>
              <Card className={`${classes.card} ${classes.right}`}>
                <CardContent
                  className={`flex-column-space-between ${classes.content}`}
                >
                  <TeamIcon color="primary" className={classes.icon} />
                  <Typography noWrap className="bold" color="primary">
                    Mon équipe et moi
                  </Typography>
                </CardContent>
              </Card>
            </ButtonBase>
          </Box>
          <Typography className={classes.explanationTitle}>
            Saisie solo
          </Typography>
          <Typography className={classes.explanationText}>
            Je saisis uniquement mon temps de travail,{" "}
            <span className="highlight">
              même si je suis en mission avec d'autres équipiers
            </span>
            .
          </Typography>
          <Typography className={classes.explanationTitle}>
            Saisie équipe
          </Typography>
          <Typography className={classes.explanationText}>
            Je saisis le temps de travail pour moi mais aussi pour mes
            coéquipiers.
            <br />
            ⚠️{" "}
            <span className="highlight">
              Je m'assure que mes coéquipiers n'enregistrent pas leurs temps de
              travail de leur côté. J'intègre dans mon équipe seulement mes
              coéquipiers qui le souhaitent.
            </span>
            .
          </Typography>
        </Container>
      </Container>
    </FunnelModal>
  );
}

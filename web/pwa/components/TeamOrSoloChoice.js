import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card/Card";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PersonIcon, TeamIcon } from "common/utils/icons";

const useStyles = makeStyles(theme => ({
  card: {
    width: 160,
    cursor: "pointer"
  },
  right: {
    marginLeft: theme.spacing(0.5)
  },
  left: {
    marginRight: theme.spacing(0.5)
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

export function TeamOrSoloChoiceModal({ open, handleClose, handleContinue }) {
  const classes = useStyles();
  const funnelModalClasses = useFunnelModalStyles();
  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <Container className={funnelModalClasses.slimContainer} disableGutters>
          <Typography className={funnelModalClasses.title} variant="h5">
            Pour qui enregistrez-vous le temps de travail&nbsp;?
          </Typography>
          <Box mt={3} mb={6} className="flex-row-center">
            <Card
              className={`${classes.card} ${classes.left}`}
              onClick={() => handleContinue(false)}
            >
              <CardContent
                className={`flex-column-space-between ${classes.content}`}
              >
                <PersonIcon color="primary" className={classes.icon} />
                <Typography className="bold" color="primary">
                  Moi
                </Typography>
              </CardContent>
            </Card>
            <Card
              className={`${classes.card} ${classes.right}`}
              onClick={() => handleContinue(true)}
            >
              <CardContent
                className={`flex-column-space-between ${classes.content}`}
              >
                <TeamIcon color="primary" className={classes.icon} />
                <Typography noWrap className="bold" color="primary">
                  Moi et mon équipe
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Container>
    </FunnelModal>
  );
}

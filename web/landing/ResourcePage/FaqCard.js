import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import { ChevronRight } from "@material-ui/icons";
import { LinkButton } from "../../common/LinkButton";
import Box from "@material-ui/core/Box";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";

const useStyles = makeStyles(theme => ({
  faqCardAnswer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  faqCardDivider: {
    marginBottom: theme.spacing(1)
  },
  faqCardButtonIcon: {
    verticalAlign: "middle"
  },
  moreInfoBlock: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(3),
    right: theme.spacing(3)
  },
  dummy: {
    height: theme.spacing(6)
  },
  linkMoreInfo: {
    color: theme.palette.primary.main,
    fontSize: "0.875rem",
    "&:hover": {
      textDecoration: "underline"
    }
  }
}));

export function FaqCard({ question, answer, link, moreInfoText }) {
  const classes = useStyles();
  const commonCardsClasses = resourceCardsClasses();

  return (
    <LinkButton
      href={link}
      className={commonCardsClasses.linkWholeCard}
      color="primary"
      target="_blank"
    >
      <Card variant="outlined" className={commonCardsClasses.card}>
        <Typography variant={"h4"}>{question}</Typography>
        <Typography className={classes.faqCardAnswer}>{answer}</Typography>
        <Box className={classes.dummy}></Box>
        <Box className={classes.moreInfoBlock}>
          <Divider className={classes.faqCardDivider} />
          <Typography className={classes.linkMoreInfo}>
            {moreInfoText || "Plus d'infos"}
            <ChevronRight className={classes.faqCardButtonIcon} />
          </Typography>
        </Box>
      </Card>
    </LinkButton>
  );
}

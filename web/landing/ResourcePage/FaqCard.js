import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import { ChevronRight } from "@material-ui/icons";
import { Link, LinkButton } from "../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  faqCard: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100]
  },
  faqCardAnswer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  faqCardDivider: {
    marginBottom: theme.spacing(2)
  },
  linkWholeCard: {
    textTransform: "none"
  },
  faqCardButtonIcon: {
    verticalAlign: "middle"
  }
}));

export function FaqCard({ question, answer, link }) {
  const classes = useStyles();

  return (
    <LinkButton href={link} className={classes.linkWholeCard}>
      <Card variant="outlined" className={classes.faqCard}>
        <Typography variant={"h4"}>{question}</Typography>
        <Typography className={classes.faqCardAnswer}>{answer}</Typography>
        <Divider className={classes.faqCardDivider} />
        <Link href={link}>
          Plus d'infos
          <ChevronRight className={classes.faqCardButtonIcon} />
        </Link>
      </Card>
    </LinkButton>
  );
}

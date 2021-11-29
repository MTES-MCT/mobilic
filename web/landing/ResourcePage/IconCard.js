import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";
import { LinkButton } from "../../common/LinkButton";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import classnames from "classnames";

const useStyles = makeStyles(theme => ({
  iconCard: {
    textAlign: "center"
  },
  icon: {
    display: "block",
    margin: "auto"
  }
}));

export function IconCard({ description, IconComponent, link }) {
  const classes = useStyles();
  const commonCardsClasses = resourceCardsClasses();

  return (
    <LinkButton
      to={link}
      className={commonCardsClasses.linkWholeCard}
      color="primary"
    >
      <Card
        variant="outlined"
        className={classnames(commonCardsClasses.card, classes.iconCard)}
      >
        <IconComponent height={150} width={150} className={classes.icon} />
        <Typography>{description}</Typography>
      </Card>
    </LinkButton>
  );
}

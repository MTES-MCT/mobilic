import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
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

export function IconCard({
  description,
  IconComponent,
  link,
  href,
  titleProps = {}
}) {
  const classes = useStyles();
  const commonCardsClasses = resourceCardsClasses();

  return (
    <LinkButton
      to={link}
      href={href}
      className={commonCardsClasses.linkWholeCard}
      priority="tertiary no outline"
    >
      <Card
        variant="outlined"
        className={classnames(commonCardsClasses.card, classes.iconCard)}
      >
        <IconComponent height={150} width={150} className={classes.icon} />
        <Typography {...titleProps}>{description}</Typography>
      </Card>
    </LinkButton>
  );
}

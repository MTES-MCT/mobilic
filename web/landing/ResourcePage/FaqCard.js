import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import Divider from "@mui/material/Divider";
import { ChevronRight } from "@mui/icons-material";
import { LinkButton } from "../../common/LinkButton";
import Box from "@mui/material/Box";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import ButtonBase from "@mui/material/ButtonBase";

const useStyles = makeStyles(theme => ({
  faqCardAnswer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
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
  },
  button: {
    textAlign: "left"
  }
}));

export function FaqCard({
  question,
  answer,
  link,
  moreInfoText,
  onClick,
  titleProps = {}
}) {
  const classes = useStyles();
  const commonCardsClasses = resourceCardsClasses();

  let buttonActionProps = { onClick };
  let ButtonComponent = ButtonBase;
  if (link) {
    buttonActionProps = { href: link, target: "_blank" };
    ButtonComponent = LinkButton;
  }

  return (
    <ButtonComponent
      className={`${commonCardsClasses.linkWholeCard} ${
        !link ? classes.button : ""
      }`}
      color="primary"
      {...buttonActionProps}
    >
      <Card variant="outlined" className={commonCardsClasses.card}>
        <Typography variant={"h4"} {...titleProps}>
          {question}
        </Typography>
        <Typography className={classes.faqCardAnswer}>{answer}</Typography>
        <Box className={classes.dummy}></Box>
        <Box className={classes.moreInfoBlock}>
          <Divider className={`hr-unstyled ${classes.faqCardDivider}`} />
          <Typography className={classes.linkMoreInfo}>
            {moreInfoText || "Plus d'infos"}
            <ChevronRight className={classes.faqCardButtonIcon} />
          </Typography>
        </Box>
      </Card>
    </ButtonComponent>
  );
}

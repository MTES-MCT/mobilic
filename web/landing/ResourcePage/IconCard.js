import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";
import { LinkButton } from "../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  iconCard: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%"
  },
  icon: {
    display: "block",
    margin: "auto"
  },
  linkWholeCard: {
    textTransform: "none",
    width: "100%",
    "& .MuiButton-label": {
      height: "100%"
    }
  }
}));

export function IconCard({ description, IconComponent, link }) {
  const classes = useStyles();

  return (
    <LinkButton href={link} className={classes.linkWholeCard} color="primary">
      <Card variant="outlined" className={classes.iconCard}>
        <IconComponent height={150} width={150} className={classes.icon} />
        <Typography>{description}</Typography>
      </Card>
    </LinkButton>
  );
}

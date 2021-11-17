import Card from "@material-ui/core/Card/Card";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

export const useInfoCardStyles = makeStyles(theme => ({
  value: {
    padding: theme.spacing(1),
    fontWeight: "bold",
    fontSize: "200%"
  },
  topMargin: {
    marginTop: theme.spacing(4)
  },
  bottomMargin: {
    marginBottom: theme.spacing(4)
  }
}));

export function InfoCard({
  title,
  titleProps = {},
  loading = false,
  children,
  px = 2,
  py = 1,
  textAlign = "justify",
  ...other
}) {
  return (
    <Card {...other}>
      <Box px={px} py={py} m={"auto"} style={{ textAlign }}>
        {title && <Typography {...titleProps}>{title}</Typography>}
        {loading ? <Skeleton rect width="100%" height={100} /> : children}
      </Box>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  subText,
  hideSubText,
  titleProps = {},
  valueProps = {},
  ...other
}) {
  const classes = useInfoCardStyles();

  return (
    <InfoCard
      title={label}
      textAlign="center"
      {...other}
      titleProps={titleProps}
    >
      <Typography className={classes.value} variant="h1" {...valueProps}>
        {value}
      </Typography>
      {subText && (
        <Typography className={hideSubText && "hidden"} variant="caption">
          {subText}
        </Typography>
      )}
    </InfoCard>
  );
}

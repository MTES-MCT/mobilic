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
  loading = false,
  children,
  disablePadding,
  center = false,
  ...other
}) {
  return (
    <Card {...other}>
      <Box
        px={disablePadding ? 0 : 2}
        py={disablePadding ? 0 : 1}
        m={"auto"}
        style={{ textAlign: center ? "center" : "justify" }}
      >
        {title && <Typography>{title}</Typography>}
        {loading ? <Skeleton rect width="100%" height={100} /> : children}
      </Box>
    </Card>
  );
}

export function MetricCard({ label, value, subText, hideSubText, ...other }) {
  const classes = useInfoCardStyles();

  return (
    <InfoCard title={label} center {...other}>
      <Typography className={classes.value} variant="h1">
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

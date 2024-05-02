import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import omit from "lodash/omit";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import React from "react";
import { makeStyles } from "@mui/styles";

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
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : (
          children
        )}
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
      <Typography
        className={`${classes.value} ${valueProps.className}`}
        variant="h1"
        component="p"
        {...omit(valueProps, ["className"])}
      >
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

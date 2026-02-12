import Card from "@mui/material/Card";
import omit from "lodash/omit";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Stack } from "@mui/material";

export const useInfoCardStyles = makeStyles(theme => ({
  value: {
    fontWeight: "bold",
    fontSize: "2rem",
    lineHeight: "2.2rem"
  },
  bottomMargin: {
    marginBottom: theme.spacing(4)
  },
  subText: {
    fontSize: "0.875rem",
    color: fr.colors.decisions.background.flat.grey.default,
    fontWeight: 700
  },
  diffText: {
    fontSize: "0.75rem",
    fontWeight: 400,
    color: fr.colors.decisions.background.flat.grey.default
  },
  diffTextValue: {
    fontSize: "0.875rem",
    fontWeight: "bold",
    color: theme.palette.primary.main
  },
  title: {
    color: fr.colors.decisions.background.flat.grey.default
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
  centered = false,
  ...other
}) {
  const classes = useInfoCardStyles();
  return (
    <Card {...other}>
      <Stack
        direction="column"
        justifyContent="center"
        sx={{ height: "100%", paddingY: py, paddingX: px }}
        {...(centered ? { alignItems: "center" } : {})}
      >
        {title && (
          <Typography {...titleProps} className={classes.title}>
            {title}
          </Typography>
        )}
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : (
          children
        )}
      </Stack>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  subText,
  diffText = "",
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
      centered
    >
      <Typography
        className={`${classes.value} ${valueProps.className}`}
        variant="h1"
        component="p"
        {...omit(valueProps, ["className"])}
      >
        {value}
      </Typography>
      {subText && !hideSubText && (
        <Typography className={classes.subText}>{subText}</Typography>
      )}
      {diffText && (
        <Typography>
          <span className={classes.diffText}>Modif : </span>
          <span className={classes.diffTextValue}>{diffText}</span>
        </Typography>
      )}
    </InfoCard>
  );
}

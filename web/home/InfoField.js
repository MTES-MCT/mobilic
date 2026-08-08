import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import { Stack } from "@mui/material";
import Notice from "../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { FieldTitle } from "../common/typography/FieldTitle";
import { useTypographyStyles } from "../common/typography/TypographyStyles";

const useStyles = makeStyles(theme => ({
  fieldValue: {
    fontWeight: props => (props.bold ? "bold" : 400)
  }
}));

export function InfoItem({
  name,
  value,
  info,
  bold,
  actionTitle,
  action,
  alertComponent,
  titleProps = {},
  valueProps = {},
  uppercaseTitle = true,
  valuePlaceholder,
  maxWidth = "70%",
  direction = "column"
}) {
  const classes = useStyles({ bold });
  const typographyClasses = useTypographyStyles();

  const title = React.useMemo(
    () => actionTitle || (value ? "Modifier" : "Ajouter")
  );

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        columnGap={1}
      >
        <Stack 
          direction={direction} 
          component="div"
          sx={{ flexGrow: 1, maxWidth }}
          alignItems={direction === "row" ? "baseline" : "flex-start"}
          columnGap={direction === "row" ? 2 : 0}
        >
          <FieldTitle uppercaseTitle={uppercaseTitle} {...titleProps}>
            {name}
          </FieldTitle>
          <Typography
            noWrap
            align="left"
            className={value ? classes.fieldValue : typographyClasses.disabled}
            {...valueProps}
          >
            {value || valuePlaceholder}
          </Typography>
        </Stack>
        {action && (
          <Grid item>
            <Button
              size="small"
              priority={value ? "tertiary" : "primary"}
              onClick={action}
            >
              {title}
            </Button>
          </Grid>
        )}
      </Stack>
      {info && <Notice description={info} />}
      {alertComponent}
    </>
  );
}

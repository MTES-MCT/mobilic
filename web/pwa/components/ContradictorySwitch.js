import React from "react";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";

const useStyles = makeStyles(theme => ({
  switch: {
    margin: "auto"
  }
}));

export function ContradictorySwitch({
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  disabled = false
}) {
  const classes = useStyles();

  return (
    <Grid container spacing={0} alignItems="center" wrap="nowrap">
      <SegmentedControl
        legend="Version du contradictoire"
        small
        className="segmented-control-contrast"
        classes={{
          root: classes.switch
        }}
        hideLegend
        segments={[
          {
            label: "Gestionnaire",
            nativeInputProps: {
              disabled: disabled,
              onChange: () => setShouldDisplayInitialEmployeeVersion(false),
              checked: !shouldDisplayInitialEmployeeVersion
            }
          },
          {
            label: "Salarié",
            nativeInputProps: {
              disabled: disabled,
              onChange: () => setShouldDisplayInitialEmployeeVersion(true),
              checked: shouldDisplayInitialEmployeeVersion
            }
          }
        ]}
      />
    </Grid>
  );
}

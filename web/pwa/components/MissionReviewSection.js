import React from "react";
import omit from "lodash/omit";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { SectionTitle } from "../../common/typography/SectionTitle";

const useStyles = makeStyles(theme => ({
  button: {
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25)
  }
}));

export function MissionReviewSection({
  title,
  displayExpandToggle,
  onEdit,
  editButtonLabel,
  titleProps = {},
  children,
  ...other
}) {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(false);
  const className = `unshrinkable ${other.className || ""}`;
  return (
    <Box px={2} py={2} className={className} {...omit(other, ["className"])}>
      <Box className="flex-row-space-between full-width">
        <SectionTitle title={title} {...titleProps} />
        {onEdit && (
          <Button
            size="small"
            priority="tertiary"
            className={classes.button}
            onClick={onEdit}
          >
            {editButtonLabel || "Modifier"}
          </Button>
        )}
        {displayExpandToggle && (
          <Button
            priority="tertiary"
            size="small"
            onClick={() => setExpand(!expand)}
            iconPosition="right"
            iconId={
              expand ? "fr-icon-arrow-up-s-fill" : "fr-icon-arrow-down-s-fill"
            }
          >
            {expand ? "Masquer" : "Afficher"}
          </Button>
        )}
      </Box>
      {!displayExpandToggle || expand ? children : null}
    </Box>
  );
}

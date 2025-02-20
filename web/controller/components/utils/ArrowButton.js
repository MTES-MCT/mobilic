import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

export const arrowButtonStyles = makeStyles(theme => ({
  button: {
    boxShadow: `inset 0 -1px 0 ${fr.colors.decisions.border.actionHigh.blueFrance.default}`,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 1
  }
}));

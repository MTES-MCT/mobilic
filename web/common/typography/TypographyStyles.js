import { fr } from "@codegouvfr/react-dsfr";
import { makeStyles } from "@mui/styles";

export const useTypographyStyles = makeStyles(theme => ({
  fieldName: {
    color: fr.colors.decisions.text.mention.grey.default,
    fontSize: props => (props.uppercaseTitle ? "0.75rem" : "0.875rem")
  },
  disabled: {
    color: fr.colors.decisions.text.disabled.grey.default
  },
  description: {
    color: fr.colors.decisions.text.mention.grey.default,
    fontSize: "0.875rem",
    lineHeight: "1.375rem"
  }
}));

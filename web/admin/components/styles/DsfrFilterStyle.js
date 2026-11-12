import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

export const useDsfrFilterStyles = makeStyles(() => ({
  formControl: {
    minWidth: 200,
    maxWidth: 500
  },
  dsfrInput: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`,
      borderRadius: "4px 4px 0 0"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none"
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem" // fr-text--sm
    },
    "& .MuiAutocomplete-tag": {
      fontSize: "0.875rem" // fr-text--sm
    }
  },
  dsfrOption: {
    fontSize: "0.875rem" // fr-text--sm
  }
}));

import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

export const useAugmentedTableStyles = makeStyles(() => ({
  augmentedTable: {
    "& .ReactVirtualized__Table__headerRow": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderTop: "none",
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`
    },
    "& .ReactVirtualized__Table__row": {
      borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
    },
    "& select": {
      borderBottom: "none"
    },
    "& .fr-select-group": {
      marginBottom: 0
    },
    "& .fr-select": {
      boxShadow: "none",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
  }
}));

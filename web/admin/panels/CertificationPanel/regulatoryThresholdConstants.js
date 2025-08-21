import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

export const GRID_CLASSES = {
  container: cx(fr.cx("fr-grid-row", "fr-grid-row--gutters")),
  column: cx(fr.cx("fr-col-md-6")),
  fullWidth: cx(fr.cx("fr-col-12"))
};

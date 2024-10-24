import React from "react";
import { RadioButtons as RadioButtonsDsfr } from "@codegouvfr/react-dsfr/RadioButtons";

import { MandatorySuffix } from "./MandatorySuffix";

export const RadioButtons = React.forwardRef(
  ({ required, legend, ...props }, ref) => {
    const augmentedLegend =
      required && legend ? (
        <>
          {legend} {<MandatorySuffix />}
        </>
      ) : (
        legend
      );

    return <RadioButtonsDsfr legend={augmentedLegend} {...props} ref={ref} />;
  }
);

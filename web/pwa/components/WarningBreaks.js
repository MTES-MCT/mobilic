import React from "react";
import Notice from "../../common/Notice";

export const WarningBreaks = () => (
  <Notice
    description={
      <>
        Pour être en règle,{" "}
        <b>pensez à respecter le temps de pause obligatoire</b> lors de votre
        prochaine mission&nbsp;!
      </>
    }
    linkUrl="https://mobilic.beta.gouv.fr/resources/regulations"
    linkText="En savoir plus sur les temps de pause minimum."
    sx={{ marginTop: 1 }}
  />
);

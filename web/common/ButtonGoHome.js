import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";

const ButtonGoHome = () => {
  const history = useHistory();

  return (
    <Button
      onClick={() => {
        history.push("/home");
      }}
      style={{ margin: "auto" }}
    >
      Aller dans mon espace
    </Button>
  );
};

export default ButtonGoHome;

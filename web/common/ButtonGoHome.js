import React from "react";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";

const ButtonGoHome = () => {
  const history = useHistory();

  return (
    <Button
      aria-label="Aller dans mon espace"
      color="primary"
      variant="contained"
      onClick={() => {
        history.push("/home");
      }}
    >
      Aller dans mon espace
    </Button>
  );
};

export default ButtonGoHome;

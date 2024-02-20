import React from "react";
import { useHistory } from "react-router-dom";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { ControllerImage, WorkerImage } from "common/utils/icons";
import { Header } from "../common/Header";
import { usePageTitle } from "../common/UsePageTitle";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "stretch",
    gap: "16px",
    textAlign: "left"
  }
}));

export default function LoginSelection() {
  usePageTitle("Connexion - Mobilic");
  const history = useHistory();
  const classes = useStyles();

  return [
    <Header key={1} />,
    <h4 key={2} className="fr-pt-2w">
      Se connecter en tant que
    </h4>,
    <div key={3} className={classNames(classes.container, "fr-mx-2w")}>
      <div className="fr-card fr-enlarge-link fr-col-12 fr-col-md-4">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h4 className="fr-card__title">
              <a href="/login">Entreprise ou salarié</a>
            </h4>
            <p className="fr-card__desc">
              Je suis travailleur mobile ou gestionnaire d'une entreprise de
              transport
            </p>
          </div>
        </div>
        <div className="fr-card__header">
          <div className="fr-card__img">
            <WorkerImage height={150} width={150} />
          </div>
        </div>
      </div>
      <div className="fr-card fr-enlarge-link fr-col-12 fr-col-md-4">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h4 className="fr-card__title">
              <a href="/controller-login">Contrôleur</a>
            </h4>
            <p className="fr-card__desc">
              Je suis Agent public de l'État et je me connecte à mon espace
              dédié
            </p>
          </div>
        </div>
        <div className="fr-card__header">
          <div className="fr-card__img">
            <ControllerImage height={150} width={150} />
          </div>
        </div>
      </div>
    </div>,
    <Typography key={4} my={2}>
      Pas encore de compte ?{" "}
      <Link
        href="/signup"
        onClick={e => {
          e.preventDefault();
          history.push("/signup");
        }}
      >
        {" "}
        Je m'inscris
      </Link>
    </Typography>
  ];
}

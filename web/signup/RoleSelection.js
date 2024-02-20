import React from "react";
import { makeStyles } from "@mui/styles";
import { ManagerImage, WorkerImage } from "common/utils/icons";
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

export function RoleSelection() {
  usePageTitle("Sélection de rôle - Mobilic");
  const classes = useStyles();

  return [
    <Header key={1} />,
    <h3 key={2} className="fr-pt-2w">
      Quel est votre métier ?
    </h3>,
    <div key={3} className={classNames(classes.container, "fr-mx-2w")}>
      <div className="fr-card fr-enlarge-link fr-col-12 fr-col-md-4">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h2 className="fr-card__title">
              <a href="/signup/user">Travailleur mobile</a>
            </h2>
            <p className="fr-card__desc">
              Je suis travailleur mobile et je dois remplir le LIC
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
            <h2 className="fr-card__title">
              <a href="/signup/user">Gestionnaire</a>
            </h2>
            <p className="fr-card__desc">
              Je suis gestionnaire d'une entreprise de transport
            </p>
          </div>
        </div>
        <div className="fr-card__header">
          <div className="fr-card__img">
            <ManagerImage height={150} width={150} />
          </div>
        </div>
      </div>
    </div>
  ];
}

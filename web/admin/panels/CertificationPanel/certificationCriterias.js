import React from "react";

export const CERTIFICATION_CRITERIAS = {
  beActive: {
    title: "La majorité des salariés inscrits utilisent Mobilic",
    explanation: (
      <span>
        Entreprises de moins de 5 salariés : au moins 50 % des salariés inscrits
        sur Mobilic s'en servent au quotidien (cela signifie que, sur une une
        période de 30 jours, ils ont au moins enregistré 2 activités par jour
        pendant 10 jours). <br />
        <br /> Entreprises d'au moins 5 salariés : au moins 60 % des salariés
        inscrits sur Mobilic s'en servent au quotidien.
      </span>
    )
  },
  notTooManyChanges: {
    title: "Validation des saisies sans modifications",
    explanation: (
      <span>
        Le gestionnaire ne doit pas modifier plus de 10 % des activités
        enregistrées par les salariés.
        <br />
        Ce critère garantit une meilleure fiabilité des données.
      </span>
    )
  },
  validateRegularly: {
    title: "Validation régulière des saisies des salariés",
    explanation: (
      <span>
        Au moins 65 % des missions doivent être validées par le gestionnaire
        dans les 7 jours suivant leur enregistrement.
        <br />
        Ce critère garantit une meilleure fiabilité des données.
      </span>
    )
  },
  logInRealTime: {
    title: "Saisie du temps de travail en temps réel",
    explanation: (
      <span>
        Au moins 65 % des activités enregistrées par les salariés de
        l'entreprise doivent avoir été lancées dans les 60 minutes suivant
        l'heure effective de début de l'activité.
        <br />
        Ce critère garantit une meilleure fiabilité des données.
      </span>
    )
  },
  beCompliant: {
    title: "Respect de l'ensemble des seuils réglementaires",
    explanation: (
      <span>
        Les activités enregistrées ne doivent pas provoquer d'alertes
        réglementaires.
        <br />
        Mobilic applique un seuil de tolérance de 10%.
      </span>
    )
  }
};

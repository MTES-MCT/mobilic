import React from "react";
import { ActivityPanel } from "../panels/Activities";
import { CompanyPanel } from "../panels/Company";
import { ValidationPanel } from "../panels/Validations";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise",
    route: "/company",
    component: props => <CompanyPanel {...props} />,
    isDefault: true
  },
  {
    label: "Activités",
    route: "/activities",
    component: props => <ActivityPanel {...props} />
  },
  {
    label: "Saisies à valider",
    route: "/validations",
    component: props => <ValidationPanel {...props} />
  }
];

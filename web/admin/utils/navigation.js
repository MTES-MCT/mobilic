import React from "react";
import { ActivityPanel } from "../panels/Activities";
import { CompanyPanel } from "../panels/Company";
// import { ValidationPanel } from "../panels/Validations";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise",
    path: "/company",
    component: props => <CompanyPanel {...props} />,
    isDefault: true
  },
  {
    label: "Activités",
    path: "/activities",
    component: props => <ActivityPanel {...props} />
  }
];

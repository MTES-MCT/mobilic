import React from "react";
import { ActivityPanel } from "../panels/Activities";
import { CompanyPanel } from "../panels/Company";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise(s)",
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

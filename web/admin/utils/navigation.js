import React from "react";
import { ActivityPanel } from "../panels/Activities";
import { CompanyPanel } from "../panels/Company";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise",
    route: "/company",
    component: <CompanyPanel />,
    isDefault: true
  },
  {
    label: "Activités",
    route: "/activities",
    component: <ActivityPanel />
  }
];

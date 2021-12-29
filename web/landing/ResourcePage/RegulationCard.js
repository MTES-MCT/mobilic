import React from "react";
import { FaqCard } from "./FaqCard";
import { useRegulationDrawer } from "./RegulationDrawer";

export function RegulationCard({ rule }) {
  const openRegulationDrawer = useRegulationDrawer();

  return (
    <FaqCard
      question={rule.name}
      answer={rule.rule}
      onClick={() => openRegulationDrawer(rule, false)}
    />
  );
}

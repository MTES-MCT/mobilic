import React from "react";
import { FaqCard } from "./FaqCard";
import { useRegulationDrawer } from "./RegulationDrawer";

export function RegulationCard({ rule, onClick = () => {}, titleProps }) {
  const openRegulationDrawer = useRegulationDrawer();

  return (
    <FaqCard
      question={rule.name}
      answer={rule.rule}
      onClick={() => {
        onClick();
        openRegulationDrawer(rule, false);
      }}
      titleProps={titleProps}
    />
  );
}

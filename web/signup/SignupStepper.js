import React from "react";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

export default function SignupStepper({ activeStep }) {
  const steps = ["Création de compte", "Inscription de l'entreprise"];

  const currentTitle = React.useMemo(() => steps[activeStep], [activeStep]);
  const nextTitle = React.useMemo(
    () => (activeStep >= steps.length - 1 ? null : steps[activeStep + 1]),
    [activeStep]
  );

  return (
    <Stepper
      currentStep={activeStep + 1}
      nextTitle={nextTitle}
      stepCount={steps.length}
      title={currentTitle}
    />
  );
}

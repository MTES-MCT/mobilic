import React from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

export default function SignupStepper({ activeStep }) {
  const steps = ["Création de compte", "Inscription de l'entreprise"];

  return (
    <Stepper alternativeLabel activeStep={activeStep}>
      {steps.map((label, index) => {
        return (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

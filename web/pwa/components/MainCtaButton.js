import React from "react";
import { LoadingButton } from "common/components/LoadingButton";

export function MainCtaButton(props) {
  return <LoadingButton variant="contained" color="primary" {...props} />;
}

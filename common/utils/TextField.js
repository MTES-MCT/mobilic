import React from "react";
import MaterialUITextField from "@mui/material/TextField";

export default function TextField(props) {
  const InputProps = props.InputProps || {};
  const InputLabelProps = props.InputLabelProps || {};
  if (props.disabled) {
    InputProps.style = {
      ...(InputProps.style || {}),
      backgroundColor: "rgba(0, 0, 0, 0.05)"
    };
    InputLabelProps.style = {
      ...(InputLabelProps.style || {}),
      color: "rgba(0, 0, 0, 0.2)"
    };
  }
  return (
    <MaterialUITextField
      {...props}
      InputProps={InputProps}
      InputLabelProps={InputLabelProps}
    >
      {props.children}
    </MaterialUITextField>
  );
}

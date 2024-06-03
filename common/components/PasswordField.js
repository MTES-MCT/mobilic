import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormHelperText from "@mui/material/FormHelperText";

export function PasswordField(props) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormControl
      className={props.className}
      fullWidth={props.fullWidth}
      required={props.required}
      variant={props.variant}
      error={props.error}
    >
      <InputLabel
        error={props.error}
        variant={props.variant}
        required={props.required}
      >
        {props.label}
      </InputLabel>
      <Input
        type={showPassword ? "text" : "password"}
        value={props.value}
        onChange={props.onChange}
        autoComplete={props.autoComplete}
        fullWidth={props.fullWidth}
        error={props.error}
        placeholder={props.placeholder}
        required={props.required}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              tabIndex={-1}
              aria-label="toggle password visibility"
              onClick={e => {
                setShowPassword(!showPassword);
                e.preventDefault();
              }}
              onMouseDown={e => {
                e.preventDefault();
              }}
              onMouseUp={e => e.preventDefault()}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText error={props.error}>
        {props.helperText || props.error}
      </FormHelperText>
    </FormControl>
  );
}

import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import FormHelperText from "@material-ui/core/FormHelperText";

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
              tabIndex="-1"
              aria-label="toggle password visibility"
              onClick={e => {
                setShowPassword(!showPassword);
                e.preventDefault();
              }}
              onMouseDown={e => {
                e.preventDefault();
              }}
              onMouseUp={e => e.preventDefault()}
              disablePointerEvents
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

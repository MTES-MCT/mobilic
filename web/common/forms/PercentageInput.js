import React from "react";
import { Input } from "./Input";
import { IconButton, Box, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  inputContainer: {
    flexGrow: 1
  },
  buttonGroup: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${theme.palette.grey[400]}`,
    borderRadius: 4,
    "& .MuiIconButton-root": {
      borderRadius: 0,
      border: "none",
      "&:hover": {
        backgroundColor: theme.palette.action.hover
      }
    },
    "& .MuiIconButton-root:first-child": {
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4
    },
    "& .MuiIconButton-root:last-child": {
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4
    }
  },
  button: {
    color: theme.palette.primary.main,
    "&:disabled": {
      color: theme.palette.grey[400]
    }
  },
  percentageDisplay: {
    padding: theme.spacing(1),
    minWidth: "40px",
    textAlign: "center",
    fontSize: "0.875rem",
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    backgroundColor: theme.palette.grey[50]
  }
}));

export const PercentageInput = ({
  initialValue = 50,
  onChangeValue,
  label,
  hintText,
  required = false,
  min = 10,
  max = 90,
  step = 10,
  compact = false
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [touched, setTouched] = React.useState(false);
  const classes = useStyles();

  const state = React.useMemo(
    () => (touched && (value < min || value > max) ? "error" : "default"),
    [touched, min, max, value]
  );

  React.useEffect(() => {
    onChangeValue(value);
  }, [value]);

  const errorMessage = React.useMemo(() => {
    if (!touched) {
      return "";
    }
    return `Veuillez entrer une valeur comprise entre ${min}% et ${max}%`;
  }, [touched, min, max]);

  const handleChange = event => {
    const inputValue = event.target.value;
    if (!inputValue) {
      setValue(inputValue);
      return;
    }

    const parsedValue = parseInt(inputValue);
    if (!isNaN(parsedValue)) {
      setValue(Math.max(min, Math.min(max, parsedValue)));
    }
  };

  const handleIncrement = () => {
    setValue(prevValue => Math.min(max, prevValue + step));
  };

  const handleDecrement = () => {
    setValue(prevValue => Math.max(min, prevValue - step));
  };

  return compact ? (
    <Box className={classes.buttonGroup}>
      <IconButton
        onClick={handleDecrement}
        disabled={value <= min}
        className={classes.button}
        size="small"
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Box className={classes.percentageDisplay}>{value}%</Box>
      <IconButton
        onClick={handleIncrement}
        disabled={value >= max}
        className={classes.button}
        size="small"
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  ) : (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <Box className={classes.inputContainer}>
        <Input
          label={label}
          required={required}
          nativeInputProps={{
            value: value || "",
            onChange: handleChange,
            inputMode: "numeric",
            type: "number",
            min: min,
            max: max,
            onBlur: () => setTouched(true)
          }}
          state={state}
          stateRelatedMessage={errorMessage}
          hintText={hintText}
        />
      </Box>
      <Box className={classes.buttonGroup}>
        <IconButton
          onClick={handleDecrement}
          disabled={value <= min}
          className={classes.button}
          size="small"
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Box className={classes.percentageDisplay}>{value}%</Box>
        <IconButton
          onClick={handleIncrement}
          disabled={value >= max}
          className={classes.button}
          size="small"
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Stack>
  );
};

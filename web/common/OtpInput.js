import React from "react";
import PropTypes from "prop-types";
import { fr } from "@codegouvfr/react-dsfr";

export function OtpInput({ value, onChange, label, length = 6, disabled = false }) {
  const inputsRef = React.useRef([]);
  const prevValueRef = React.useRef(value);
  const digits = value.split("").concat(new Array(length).fill("")).slice(0, length);

  React.useEffect(() => {
    if (prevValueRef.current.length > 0 && value.length === 0) {
      focusInput(0);
    }
    prevValueRef.current = value;
  }, [value]);

  const focusInput = (index) => {
    if (inputsRef.current[index]) inputsRef.current[index].focus();
  };

  const handleChange = (e, index) => {
    const char = e.target.value.replaceAll(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join("").slice(0, length);
    onChange(newValue);
    if (char && index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replaceAll(/\D/g, "")
      .slice(0, length);
    onChange(pasted);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div className={fr.cx("fr-input-group")}>
      {label && (
        <label className={fr.cx("fr-label")} style={{ textAlign: "center" }}>
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          gap: fr.spacing("2v"),
          justifyContent: "center"
        }}
      >
        {digits.map((digit, i) => (
          <input
            key={`otp-${i}`} // NOSONAR — fixed-size array, never reordered
            id={`otp-${i}`}
            ref={(el) => (inputsRef.current[i] = el)}
            className={fr.cx("fr-input")}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Chiffre ${i + 1} sur ${length}`}
            aria-required="true"
            style={{
              width: 48,
              height: 56,
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: 600,
              padding: 0,
              opacity: disabled ? 0.5 : 1
            }}
          />
        ))}
      </div>
    </div>
  );
}

OtpInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  length: PropTypes.number,
  disabled: PropTypes.bool
};

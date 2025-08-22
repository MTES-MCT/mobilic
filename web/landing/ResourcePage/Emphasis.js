import React from "react";

export function Emphasis({ whiteSpace, ...otherProps }) {
  return (
    <span
      style={{
        fontWeight: "bold",
        whiteSpace: whiteSpace || "nowrap",
        backgroundColor: "#ffee66"
      }}
      {...otherProps}
    />
  );
}

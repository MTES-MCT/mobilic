import React from "react";

export function Emphasis(props) {
  return (
    <span
      style={{
        fontWeight: "bold",
        whiteSpace: "nowrap",
        backgroundColor: "#ffee66"
      }}
      {...props}
    />
  );
}

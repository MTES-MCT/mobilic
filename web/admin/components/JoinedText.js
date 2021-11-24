import React from "react";

export function JoinedText({ children, joinWith }) {
  return (
    <span>
      {React.Children.toArray(children).map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < React.Children.count(children) - 1 ? joinWith : ""}
        </React.Fragment>
      ))}
    </span>
  );
}

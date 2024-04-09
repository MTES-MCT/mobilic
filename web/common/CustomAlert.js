import React from "react";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";

const CustomAlert = React.forwardRef(
  ({ message, onClose, severity, elevation, variant, style }, ref) => {
    const isMessageArray = Array.isArray(message);

    return (
      <Alert
        ref={ref}
        onClose={onClose}
        severity={severity}
        elevation={elevation}
        variant={variant}
        style={style}
      >
        {isMessageArray
          ? message.map((msg, index) => (
              <div key={index}>
                {msg.message}
                {msg.link && (
                  <>
                    {" "}
                    <Link
                      href={msg.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {msg.link.text}
                    </Link>
                  </>
                )}
              </div>
            ))
          : message}
      </Alert>
    );
  }
);

export default CustomAlert;

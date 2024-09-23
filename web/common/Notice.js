import React from "react";
import Box from "@mui/material/Box";

export const Notice = ({ title, description, linkUrl, linkText }) => {
  return (
    <Box className="fr-notice fr-notice--info">
      <Box className="fr-container">
        <Box className="fr-notice__body">
          <p>
            <span className="fr-notice__title">{title}</span>
            <span className="fr-notice__desc">{description}</span>
            {linkUrl && linkText && (
              <a
                target="_blank"
                rel="noopener external noreferrer"
                title={`${linkText} - nouvelle fenêtre`}
                href={linkUrl}
                className="fr-notice__link"
              >
                {linkText}
              </a>
            )}
          </p>
        </Box>
      </Box>
    </Box>
  );
};

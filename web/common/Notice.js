import React from "react";
import Box from "@mui/material/Box";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { fr } from "@codegouvfr/react-dsfr";

const Notice = ({
  className,
  title,
  description,
  size = "normal",
  type = "info",
  linkUrl,
  linkText,
  style,
  isFullWidth = true,
  classes = {},
  sx = {},
  onClose = null
}) => {
  return (
    <Box
      className={cx(
        fr.cx("fr-notice", `fr-notice--${type}`),
        classes.root,
        className
      )}
      style={{ ...style, textAlign: "initial" }}
      sx={sx}
    >
      <Box
        className={cx(fr.cx("fr-container"), classes.container)}
        style={{
          ...(isFullWidth && { maxWidth: "100%" })
        }}
      >
        <Box className="fr-notice__body" style={!onClose ? { padding: 0 } : {}}>
          <p>
            <span
              className={cx(
                fr.cx("fr-notice__title", { "fr-text--sm": size === "small" }),
                classes.title
              )}
            >
              {title}{" "}
              <span className={fr.cx("fr-text--regular")}>{description}</span>
              {linkUrl && linkText && (
                <a
                  target="_blank"
                  rel="noopener external noreferrer"
                  title={`${linkText} - nouvelle fenêtre`}
                  href={linkUrl}
                  className={cx(
                    fr.cx("fr-notice__link", {
                      "fr-text--sm": size === "small"
                    }),
                    classes.link
                  )}
                >
                  {linkText}
                </a>
              )}
            </span>
          </p>
          {onClose && (
            <button
              title="Masquer le message"
              onClick={onClose}
              id="button-1299"
              className="fr-btn--close fr-btn"
            >
              Masquer le message
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Notice;

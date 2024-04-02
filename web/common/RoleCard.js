import React from "react";
import classNames from "classnames";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  card: {
    [theme.breakpoints.up("md")]: {
      minWidth: "360px"
    }
  }
}));

export function RoleCard({ destination, title, description, image }) {
  const classes = useStyles();
  return (
    <div
      className={classNames(
        "fr-card fr-enlarge-link fr-col-12 fr-col-md-4",
        classes.card
      )}
    >
      <div className="fr-card__body">
        <div className="fr-card__content">
          <h4 className="fr-card__title">
            <a href={destination}>{title}</a>
          </h4>
          <p className="fr-card__desc">{description}</p>
        </div>
      </div>
      <div className="fr-card__header">
        <div className="fr-card__img">
          {React.cloneElement(image, { height: 150, width: 150 })}
        </div>
      </div>
    </div>
  );
}

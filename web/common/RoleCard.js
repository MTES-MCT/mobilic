import React from "react";

export function RoleCard({ destination, title, description, image }) {
  return (
    <div className="fr-card fr-enlarge-link fr-col-12 fr-col-md-4">
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

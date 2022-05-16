import React from "react";
import { useModals } from "common/utils/modals";

export function Follow() {
  const modals = useModals();
  return (
    <div className="fr-follow">
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-8">
            <div className="fr-follow__newsletter">
              <div>
                <p className="fr-h5">
                  Abonnez-vous à notre lettre d’information
                </p>
              </div>
              <div>
                <button
                  className="fr-btn"
                  title="S‘abonner à notre lettre d’information"
                  onClick={() => modals.open("newsletterSubscription")}
                >
                  S&#39;abonner
                </button>
              </div>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <div className="fr-follow__social">
              <p className="fr-h5">
                Suivez-nous
                <br /> sur les réseaux sociaux
              </p>
              <ul className="fr-btns-group">
                <li>
                  <a
                    className="fr-btn--facebook fr-btn"
                    href="https://www.facebook.com/Mobilic-115289304492481"
                    target="_blank"
                    rel="noreferrer"
                  >
                    facebook
                  </a>
                </li>
                <li>
                  <a
                    className="fr-btn--twitter fr-btn"
                    href="https://twitter.com/Mobilic_gouv"
                    target="_blank"
                    rel="noreferrer"
                  >
                    twitter
                  </a>
                </li>
                <li>
                  <a
                    className="fr-btn--linkedin fr-btn"
                    href="https://www.linkedin.com/company/mobilic-beta-gouv"
                    target="_blank"
                    rel="noreferrer"
                  >
                    linkedin
                  </a>
                </li>
                <li>
                  <a
                    className="fr-btn--youtube fr-btn"
                    href="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    youtube
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

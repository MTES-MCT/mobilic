import React from "react";
import { useModals } from "common/utils/modals";
import { Follow as DSFollow } from "@codegouvfr/react-dsfr/Follow";

export function Follow() {
  const modals = useModals();
  return (
    <DSFollow
      newsletter={{
        buttonProps: {
          onClick: () => modals.open("newsletterSubscription")
        }
      }}
      social={{
        buttons: [
          {
            linkProps: {
              to: "https://www.facebook.com/Mobilic-115289304492481"
            },
            type: "facebook"
          },
          {
            linkProps: {
              to: "https://twitter.com/Mobilic_gouv"
            },
            type: "twitter-x"
          },
          {
            linkProps: {
              to: "https://www.linkedin.com/company/mobilic-beta-gouv"
            },
            type: "linkedin"
          },
          {
            linkProps: {
              to: "https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg"
            },
            type: "youtube"
          }
        ]
      }}
    />
  );
}

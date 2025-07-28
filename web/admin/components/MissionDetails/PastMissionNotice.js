import React from "react";
import Notice from "../../../common/Notice";

export const PastMissionNotice = ({
  missionName,
  justification,
  submitter,
  ...otherProps
}) => {
  return (
    <Notice
      description={
        <>
          Mission <b>{missionName}</b> ajoutée a posteriori
          {submitter && (
            <>
              {" par "}
              <b>
                {submitter.firstName} {submitter.lastName}
              </b>
            </>
          )}
          .
          <br />
          Motif : "{justification}."
        </>
      }
      {...otherProps}
    />
  );
};

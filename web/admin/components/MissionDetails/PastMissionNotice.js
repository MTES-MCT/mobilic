import React from "react";
import Notice from "../../../common/Notice";

export const PastMissionNotice = ({ missionName, justification }) => {
  return (
    <Notice
      description={
        <>
          Mission <b>{missionName}</b> ajoutée a posteriori.
          <br />
          Motif : "{justification}."
        </>
      }
    />
  );
};

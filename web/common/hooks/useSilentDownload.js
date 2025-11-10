import React from "react";

export const useSilentDownload = () => {
  const silentDownload = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return { silentDownload };
};

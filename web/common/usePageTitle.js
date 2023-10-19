import { useEffect } from "react";

export const usePageTitle = pageTitle => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle;
    return () => (document.title = previousTitle);
  }, []);
};

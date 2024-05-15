export const getNextHeadingComponent = headingComponent => {
  switch (headingComponent) {
    case "h1":
      return "h2";
    case "h2":
      return "h3";
    case "h3":
      return "h4";
    case "h4":
      return "h5";
    case "h5":
      return "h6";
    case "h6":
      return "p";
    default:
      return "p";
  }
};

export const getPrevHeadingComponent = headingComponent => {
  switch (headingComponent) {
    case "h1":
      return "h1";
    case "h2":
      return "h1";
    case "h3":
      return "h2";
    case "h4":
      return "h3";
    case "h5":
      return "h4";
    case "h6":
      return "h5";
    default:
      return "h6";
  }
};

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
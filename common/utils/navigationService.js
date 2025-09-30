import { RouteResolver } from "./routeResolver";
import { FRANCE_CONNECT_REDIRECTION_RULES } from "./franceConnectRoutes";

export class NavigationService {
  constructor(history) {
    this.history = history;
  }

  handleFranceConnectRedirection(context, userType, nextParam) {
    const targetPath = RouteResolver.resolve(
      FRANCE_CONNECT_REDIRECTION_RULES,
      context,
      userType,
      nextParam
    );

    if (targetPath) {
      const cleanUrl = new URL(targetPath, window.location.origin);
      sessionStorage.setItem("fcRedirection", "true");
      this.history.push(cleanUrl.pathname);
    }
  }
}

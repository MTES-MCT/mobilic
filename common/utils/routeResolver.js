export class RouteResolver {
  static resolve(config, context, userType, nextParam) {
    const rule = config[context];
    if (!rule) return nextParam;

    if (rule.ignoreNext) {
      return rule[userType] || rule.default;
    }

    return nextParam || rule[userType] || rule.default;
  }
}

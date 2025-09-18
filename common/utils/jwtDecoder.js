export class JWTDecoder {
  static decode(state) {
    if (!state) return null;

    try {
      const jwtPayload = JSON.parse(atob(state.split(".")[1]));
      return jwtPayload;
    } catch (error) {
      console.warn("Unable to decode JWT state:", error);
      return null;
    }
  }

  static getCreateFlag(state) {
    const payload = this.decode(state);
    return payload?.create === true;
  }
}

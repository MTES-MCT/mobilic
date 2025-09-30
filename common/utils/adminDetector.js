import { JWTDecoder } from "./jwtDecoder";

export class AdminDetector {
  static isAdminSignup(state) {
    if (!state) return false;

    const payload = JWTDecoder.decode(state);
    if (!payload) return false;

    const context = payload.context;
    const nextUrl = payload.next;

    return context === "signup" && nextUrl?.includes("admin=true");
  }
}

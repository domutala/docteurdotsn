import * as jwt from "jsonwebtoken";
import rsa from "./forge";

export function sign(value: any, options?: jwt.SignOptions) {
  const token = jwt.sign(value, rsa.keys.private, {
    algorithm: "RS256",
    ...options,
  });
  return token;
}

export function verify(token: string) {
  const decode = jwt.verify(token, rsa.keys.private);
  return decode;
}

export default { sign, verify };

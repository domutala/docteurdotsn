import { Session } from "database/entitys/Session";
import type { auth } from "firebase-admin";

export declare global {
  namespace Express {
    interface Request {
      user: { uid: string; email: string };
      session: Session;
    }
  }
}

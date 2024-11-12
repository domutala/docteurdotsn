import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import * as admin from "firebase-admin";

@Injectable()
export class FirebaseAuthService {
  constructor(
    @Inject("FIREBASE_ADMIN") private readonly firebaseAdmin: admin.app.App,
  ) {}

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.firebaseAdmin.auth().verifyIdToken(token);
    } catch (error) {
      throw new UnauthorizedException("invalid_firebase_token");
    }
  }

  async getUser(uid: string) {
    const user = await this.firebaseAdmin.auth().getUser(uid);
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.firebaseAdmin.auth().getUserByEmail(email);
    return user;
  }
}

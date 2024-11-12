import {
  Injectable,
  Inject,
  UnauthorizedException,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { SessionRepository } from "database/repositorys/Session";
import { UserRepository } from "database/repositorys/User";
import { Request } from "express";

@Injectable()
export class AuthService {
  @Inject() private sessionRepository: SessionRepository;
  @Inject() private userRepository: UserRepository;

  async verifyToken(token: string) {
    const session = await this.sessionRepository._findOne({ id: token });
    return session;
  }

  //   async getUser(uid: string) {
  //     const user = await this.firebaseAdmin.auth().getUser(uid);
  //     return user;
  //   }

  //   async getUserByEmail(email: string) {
  //     const user = await this.firebaseAdmin.auth().getUserByEmail(email);
  //     return user;
  //   }
}

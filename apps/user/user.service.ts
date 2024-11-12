import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "database/repositorys/User";

@Injectable()
export class UserService {
  @Inject() private repository: UserRepository;

  async confirmation(token: string) {
    return await this.repository._confirmation(token);
  }
}

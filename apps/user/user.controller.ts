import { Controller, Get, Inject, Body, Post, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { Public } from "decorators/public";

@Controller("user")
export class UserController {
  constructor() {}

  @Inject() private readonly service: UserService;

  @Public()
  @Get("confirmation/:token")
  async confirmation(@Param("token") token: string) {
    return await this.service.confirmation(token);
  }
}

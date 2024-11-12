import { Controller, Get, Inject, Body, Post } from "@nestjs/common";
import { SessionService } from "./session.service";
import { Public } from "decorators/public";

@Controller("session")
export class SessionController {
  constructor() {}

  @Inject() private readonly service: SessionService;

  @Public()
  @Post("init")
  async init(@Body() body: any) {
    return await this.service.init();
  }

  @Public()
  @Post("login")
  async login(@Body() body: any) {
    return await this.service.login(body);
  }

  @Post("logout")
  async logout() {
    return await this.service.logout();
  }

  @Post("update-password")
  async updatePassword(@Body() body: any) {
    return await this.service.updatePassword(body);
  }

  @Post("request-reset-password")
  async requestPasswordReset(@Body() body: any) {
    return await this.service.requestPasswordReset(body);
  }

  @Post("reset-password")
  async resetPassword(@Body() body: any) {
    return await this.service.resetPassword(body);
  }
}

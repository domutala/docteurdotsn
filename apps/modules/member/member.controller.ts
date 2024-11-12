import { Controller, Get, Inject, Body, Post, Param } from "@nestjs/common";
import { MemberService } from "./member.service";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { MemberState } from "database/entitys/Organization";

@Controller("member/:organization")
export class MemberController {
  constructor() {}

  @Inject() private readonly service: MemberService;
  @Inject(REQUEST) private request: Request;

  @Get("/:uid")
  async getUser(
    @Param("organization") organization: string,
    @Param("uid") uid: string,
  ) {
    return await this.service.get({ organization, uid });
  }

  @Post("/invite/:email")
  async invite(
    @Param("organization") organization: string,
    @Param("email") email: string,
  ) {
    return await this.service.invite({ organization, email });
  }

  @Post("/set-state")
  async setState(
    @Param("organization") organization: string,
    @Body("state") state: MemberState,
    @Body("uid") uid: string,
  ) {
    return await this.service.setState({
      organization,
      state,
      uid: state === "disabled" ? uid : this.request.user.uid,
    });
  }
}

import { Controller, Get, Inject, Body, Post } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { Public } from "decorators/public";

@Controller("doctor")
export class DoctorController {
  constructor() {}

  @Inject() private readonly service: DoctorService;

  @Public()
  @Post("register")
  async getUser(@Body() body: any) {
    return await this.service.signup(body);
  }
}

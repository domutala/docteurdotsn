import { Controller, Inject, Body, Post, Param, Get } from "@nestjs/common";
import { InputService } from "./input.service";
import { Public } from "decorators/public";

@Controller("input")
export class InputController {
  constructor() {}

  @Inject() private readonly service: InputService;

  @Post("/")
  @Public()
  async create(@Body() body: any) {
    return await this.service.create(body);
  }
}

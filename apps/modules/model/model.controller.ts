import { Controller, Inject, Body, Post, Param, Get } from "@nestjs/common";
import { ModelService } from "./model.service";
import { Public } from "decorators/public";

@Controller("model")
export class ModelController {
  constructor() {}

  @Inject() private readonly service: ModelService;

  @Post("/create")
  async create(@Body() body: any) {
    return await this.service.create(body);
  }

  @Post("remove/:id")
  async remove(@Param("id") id: any) {
    return await this.service.remove({ id });
  }

  @Get("/:id")
  @Public()
  async get(@Param("id") id: any) {
    return await this.service.get({ id });
  }
}

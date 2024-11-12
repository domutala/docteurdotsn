import { Controller, Get, Inject, Body, Post, Param } from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { Public } from "decorators/public";

@Controller("organization")
export class ModelController {
  constructor() {}

  @Inject() private readonly service: OrganizationService;

  @Post("/create")
  async create(@Body() body: any) {
    return await this.service.create(body);
  }

  @Post("remove/:id")
  async remove(@Param("id") id: any) {
    return await this.service.remove({ id });
  }

  @Post("/:organization/inputs/:model")
  async getInputs(
    @Param("organization") organization: string,
    @Param("model") model: string,
    @Body() params: any,
  ) {
    return await this.service.getInputs({
      ...(params || {}),
      organization,
      model,
    });
  }

  @Get("/")
  async list() {
    return await this.service.list();
  }

  @Public()
  @Get("/order/:id")
  async getOrder(@Param("id") id: string) {
    return await this.service.getOrder({ id });
  }

  @Post("/order/create")
  async createOrder(@Body() order: any) {
    return await this.service.createOrder(order);
  }

  @Public()
  @Post("/order/capture/:orderID")
  async captureOrder(@Param("orderID") orderID: string) {
    return await this.service.captureOrder({ orderID });
  }

  @Public()
  @Post("/:organization/get-stats")
  async getStats(
    @Body() body: any,
    @Param("organization") organization: string,
  ) {
    return await this.service.getStats({ ...body, id: organization });
  }
}

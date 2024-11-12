import { Controller, Get } from "@nestjs/common";
import { Public } from "decorators/public";

@Controller("/")
export class AppController {
  @Public()
  @Get("/ping")
  main(): string {
    return "docteurdotsn";
  }
}

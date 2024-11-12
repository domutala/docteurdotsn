import { Module } from "@nestjs/common";
import { InputController } from "./input.controller";
import { InputService } from "./input.service";
import providers from "database/repositorys/providers";

@Module({
  controllers: [InputController],
  providers: [...providers, InputService],
  exports: [],
})
export class InputModule {}

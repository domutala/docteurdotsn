import { Module } from "@nestjs/common";
import { ModelController } from "./model.controller";
import { ModelService } from "./model.service";
import providers from "database/repositorys/providers";

@Module({
  controllers: [ModelController],
  providers: [...providers, ModelService],
  exports: [],
})
export class ModelModule {}

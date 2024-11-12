import { Module } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { DoctorController } from "./doctor.controller";
import providers from "database/repositorys/providers";

@Module({
  controllers: [DoctorController],
  providers: [...providers, DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}

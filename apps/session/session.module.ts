import { Module } from "@nestjs/common";
import { SessionService } from "./session.service";
import { SessionController } from "./session.controller";
import providers from "database/repositorys/providers";

@Module({
  controllers: [SessionController],
  providers: [...providers, SessionService],
  exports: [SessionService],
})
export class SessionModule {}

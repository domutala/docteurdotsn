import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import providers from "database/repositorys/providers";

@Module({
  controllers: [],
  providers: [...providers, AuthService],
  exports: [AuthService],
})
export class AuthModule {}

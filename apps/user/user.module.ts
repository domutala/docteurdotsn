import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import providers from "database/repositorys/providers";

@Module({
  controllers: [UserController],
  providers: [...providers, UserService],
  exports: [UserService],
})
export class UserModule {}

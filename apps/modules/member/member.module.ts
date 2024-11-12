import { Module } from "@nestjs/common";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";
import providers from "database/repositorys/providers";
import { FirebaseAdminModule } from "apps/firebase/admin.module";

@Module({
  imports: [FirebaseAdminModule],
  controllers: [MemberController],
  providers: [...providers, MemberService],
  exports: [],
})
export class MemberModule {}

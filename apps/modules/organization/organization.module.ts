import { Module } from "@nestjs/common";
import { ModelController } from "./organization.controller";
import { OrganizationService } from "./organization.service";
import providers from "database/repositorys/providers";
import { OrganizationRepository } from "database/repositorys/Organization";
import { PaypalModule } from "apps/paypal/paypal.module";

@Module({
  imports: [PaypalModule],
  controllers: [ModelController],
  providers: [...providers, OrganizationService],
  exports: [OrganizationRepository],
})
export class OrganizationModule {}

import { Module } from "@nestjs/common";
import { PaypalService } from "./paypal.service";

@Module({
  controllers: [],
  providers: [PaypalService],
  exports: [PaypalService],
})
export class PaypalModule {}

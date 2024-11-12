import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigDatabase } from "database";
import { AppController } from "./controller";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { SessionModule } from "./session/session.module";
import { DoctorModule } from "./doctor/doctor.module";
import { GlobalInterceptor } from "interceptors/global";
import { UserModule } from "./user/user.module";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ ...ConfigDatabase(), autoLoadEntities: true }),

    AuthModule,
    SessionModule,
    UserModule,
    DoctorModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: GlobalInterceptor },
  ],
})
export class AppModule {}

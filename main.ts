import { NestFactory } from "@nestjs/core";
import { AppModule } from "./apps/module";
import { json } from "express";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: "*" } });
  const port = process.env.PORT || 3000;

  app.use(json({ limit: "50mb" }));
  await app.listen(port);

  Logger.log(
    `v-${process.env.npm_package_version} listen at http://localhost:${port}`,
  );
}
bootstrap();
